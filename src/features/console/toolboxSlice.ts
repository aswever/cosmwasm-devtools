import { coins } from "@cosmjs/proto-signing";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { toMicroAmount } from "../../util/coins";
import { selectedAccount, selectedContract } from "../accounts/accountsSlice";
import connectionManager from "../connection/connectionManager";

export const highlightColors = {
    keyColor: "black",
    numberColor: "blue",
    stringColor: "#0B7500",
    trueColor: "#00cc00",
    falseColor: "#ff8080",
    nullColor: "cornflowerblue",
};

export interface ExecuteOptions {
    funds: string;
    memo: string;
}

export interface ToolboxState {
    input: string;
    output: string;
    error: boolean;
    optionsOpen: boolean;
    executeOptions?: ExecuteOptions;
    toolboxQueryOptions: {
        [key: string]: {
            [key: string]: {};
        };
    };
    toolboxQueryProcessing: boolean;
    toolboxQueryReady: boolean;
    toolboxQueryCtr: number;
    stateReset: boolean;
}

const MASTER_KEY: string = "D7DFB68ED7C1BA3C1BA5184251C52";

const initialState: ToolboxState = {
    input: "",
    output: "Response will appear here",
    error: false,
    optionsOpen: false,
    toolboxQueryOptions: {},
    toolboxQueryProcessing: false,
    toolboxQueryReady: false,
    toolboxQueryCtr: 0,
    stateReset: false
};

class ToolboxError extends Error {}

const run = createAsyncThunk(
    "toolbox/run",
    async (
        command: (msgObj: any) => Promise<any>,
        { getState }
    ): Promise<string> => {
        let result = "";
        try {
            let msgObj = {};
            if ((getState() as RootState)?.toolbox?.input.length > 0) {
                msgObj = JSON.parse((getState() as RootState).toolbox.input);
            }
            const resObj = await command(msgObj);
            result = JSON.stringify(resObj, null, 2);
        } catch (e) {
            if (e instanceof SyntaxError) {
                throw new ToolboxError(`Invalid JSON: ${e.message}`);
            } else if (e instanceof Error) {
                throw new ToolboxError(`Error: ${e.message}`);
            } else {
                throw new ToolboxError(`Unknown error: ${e}`);
            }
        }

        return result;
    }
);

export const buildQueryToolbox = (): AppThunk => (dispatch, getState) => {
    dispatch(
        run(async () => {
            dispatch(setToolboxQueryProcessing(false));
            dispatch(setToolboxQueryReady(false));

            let queryObj: { [key: string]: {} } = {};
            queryObj[MASTER_KEY] = {};
            const contract = selectedContract(getState());
            if (!contract) throw new Error("No contract selected");
            const conn = await connectionManager.getQueryClient(
                getState().connection.config
            );
            return conn?.client?.wasm.queryContractSmart(
                contract.address,
                queryObj
            );
        })
    );
};

interface IRunQuery {
    cmd: string;
    isLastQuery: boolean;
}

const runQuery = createAsyncThunk(
    "toolbox/runQuery",
    async (command: (msgObj: any) => Promise<any>, { getState, dispatch }) =>
        //): Promise<string> => {
        {
            let result = "";
            try {
                let msgObj = {};

                const resObj = await command(msgObj);
                let iRunQuery = resObj() as IRunQuery;

                let _state = getState() as RootState;

                let queryObj: {
                    [key: string]: {
                        [key: string]: {};
                    };
                } = {};

                queryObj[iRunQuery.cmd] = {};
                queryObj[iRunQuery.cmd][MASTER_KEY] = {};

                const contract = selectedContract(_state);

                if (!contract) throw new Error("No contract selected");

                const conn = await connectionManager.getQueryClient(
                    _state.connection.config
                );

                const func = new Promise<any>((resolve, reject) => {
                    resolve(
                        conn?.client?.wasm.queryContractSmart(
                            contract.address,
                            queryObj
                        )
                    );
                });

                let resObj2: any = await func
                    .then((res) => {
                        return res;
                    })
                    .catch((e2) => {
                        if ("message" in e2) {
                            let regExp = /`(.*?)`/g;
                            let match = [...e2.message.matchAll(regExp)];

                            let toolboxOptions: IToolboxOptions = {
                                key: iRunQuery.cmd,
                                options: {},
                            };

                            if (match && match.length > 0) {
                                match.forEach((cmd) => {
                                    if (
                                        cmd &&
                                        cmd.length > 0 &&
                                        cmd[1] &&
                                        cmd[1] !== MASTER_KEY
                                    ) {
                                        toolboxOptions.options[cmd[1]] = "";
                                    }
                                });
                            }

                            dispatch(setToolboxQueryOptions(toolboxOptions));

                            dispatch(setToolboxQueryCtr());

                            if (iRunQuery.isLastQuery) {
                                dispatch(setToolboxQueryReady(true));
                            }
                        }
                    });

                //result = JSON.stringify(resObj2, null, 2);
            } catch (e) {}

            //return result;
        }
);

export const toolboxQuery =
    (cmd: string, isLastQuery: boolean): AppThunk =>
    (dispatch, _) => {
        dispatch(
            runQuery(async () => {
                dispatch(setToolboxQueryReady(false));

                return () => {
                    return { cmd, isLastQuery };
                };
            })
        );
    };

export const execute =
    ({
        memo,
        funds,
    }: {
        memo?: string;
        funds?: string;
    } = {}): AppThunk =>
    (dispatch, getState) => {
        dispatch(
            run(async (executeObj) => {
                const config = getState().connection.config;
                const contract = selectedContract(getState());
                const account = selectedAccount(getState());
                if (!contract) throw new Error("No contract selected");
                if (!account) throw new Error("No account selected");

                const client = await connectionManager.getSigningClient(
                    account,
                    config
                );

                const executeOptions = getState().toolbox.executeOptions;
                const executeMemo = memo ?? executeOptions?.memo;
                const executeFunds = funds ?? executeOptions?.funds;

                return client.execute(
                    account.address,
                    contract.address,
                    executeObj,
                    "auto",
                    executeMemo,
                    executeFunds
                        ? coins(
                              toMicroAmount(
                                  executeFunds,
                                  config["coinDecimals"]
                              ),
                              config["microDenom"]
                          )
                        : undefined
                );
            })
        );
    };

interface IToolboxOptions {
    key: string;
    options: {
        [key: string]: {};
    };
}

export const toolboxSlice = createSlice({
    name: "toolbox",
    initialState,
    reducers: {
        setInput: (state, action: PayloadAction<string>) => {
            state.input = action.payload;
        },
        setOutput: (state, action: PayloadAction<string>) => {
            state.output = action.payload;
        },
        setExecuteOptions: (state, action: PayloadAction<ExecuteOptions>) => {
            state.executeOptions = action.payload;
        },
        setToolboxQueryProcessing: (state, action: PayloadAction<boolean>) => {
            state.toolboxQueryProcessing = action.payload;
        },
        setToolboxQueryReady: (state, action: PayloadAction<boolean>) => {
            state.toolboxQueryReady = action.payload;
        },
        setToolboxQueryOptions: (
            state,
            action: PayloadAction<IToolboxOptions>
        ) => {
            if (action.payload) {
                let newObj = { ...state.toolboxQueryOptions };
                let newSubObj = Object.assign(
                    {},
                    state.toolboxQueryOptions[action.payload.key] ?? {},
                    action.payload.options ?? {}
                );

                newObj[action.payload.key] = newSubObj;

                state.toolboxQueryOptions = newObj;
            }
        },
        setToolboxQueryCtr: (state) => {
            state.toolboxQueryCtr++;
        },
        resetState: (state) => {
            state.toolboxQueryOptions = {};
            state.toolboxQueryProcessing = false;
            state.toolboxQueryReady = false;
            state.toolboxQueryCtr = 0;
            state.stateReset = true;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(run.pending, (state) => {
                state.output = "Loading...";
            })
            .addCase(run.fulfilled, (state, action) => {
                state.output = action.payload;
                state.error = false;
            })
            .addCase(run.rejected, (state, action) => {
                if (action.error.message?.includes(MASTER_KEY)) {
                    state.stateReset = false;
                    state.toolboxQueryOptions = {};

                    let regExp = /`(.*?)`/g;
                    let match = [...action.error.message.matchAll(regExp)];

                    if (match && match.length > 0) {
                        match.forEach((cmd) => {
                            if (
                                cmd &&
                                cmd.length > 0 &&
                                cmd[1] &&
                                cmd[1] !== MASTER_KEY
                            ) {
                                state.toolboxQueryOptions[cmd[1]] = {};
                            }
                        });
                    }

                    state.toolboxQueryProcessing = true;
                }
            });
    },
});

export const {
    setInput,
    setOutput,
    setExecuteOptions,
    setToolboxQueryProcessing,
    setToolboxQueryReady,
    setToolboxQueryOptions,
    setToolboxQueryCtr,
    resetState
} = toolboxSlice.actions;

export default toolboxSlice.reducer;
