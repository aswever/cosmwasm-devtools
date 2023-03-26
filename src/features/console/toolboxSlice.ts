import { coins } from "@cosmjs/proto-signing";
import { serializeSignDoc, Secp256k1HdWallet } from "@cosmjs/launchpad";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { toMicroAmount } from "../../util/coins";
import {
    selectedAccount,
    selectedContract,
    AccountType,
} from "../accounts/accountsSlice";
import connectionManager from "../connection/connectionManager";
import { StdSignature } from "@cosmjs/amino";
import { getKeplr } from "../accounts/useKeplr";
import { makeADR36AminoSignDoc } from "../../util/adr36";

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
}

const initialState: ToolboxState = {
    input: "",
    output: "Response will appear here",
    error: false,
    optionsOpen: false,
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
            const queryObj = {
                intentionally_poWHSIKEYor_query: "",
            };
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
                console.log(`action.error.message`);
                console.log(JSON.stringify(action.error));
                if (
                    action.error.message?.includes(
                        "intentionally_poWHSIKEYor_query"
                    )
                ) {
                    let regExp = new RegExp(
                        "^(.*?)\\s(expected one of)\\s(.*?)(\\: query wasm)(.*?)$",
                        "g"
                    );

                    let match = regExp.exec(action.error.message)

                    console.log(action)

                    if (match && match.length === 6) {
                        let queryMsgCommands = match[3].replaceAll('`', '');
                        console.log(queryMsgCommands)
                    }
                }
                state.output = action.error.message ?? "Error";
                state.error = true;
            });
    },
});

export const { setInput, setOutput, setExecuteOptions } = toolboxSlice.actions;

export default toolboxSlice.reducer;
