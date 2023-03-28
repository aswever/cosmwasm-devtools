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

export interface InstantiateOptions {
    codeId: string;
    label: string;
    funds?: string;
    memo?: string;
    admin?: string;
}

export interface ConsoleState {
    input: string;
    output: string;
    errorOutput: string;
    error: boolean;
    optionsOpen: boolean;
    instantiateOpen: boolean;
    executeOptions?: ExecuteOptions;
    instantiateOptions?: InstantiateOptions;
}

const initialState: ConsoleState = {
    input: "",
    output: "Response will appear here",
    errorOutput: "",
    error: false,
    optionsOpen: false,
    instantiateOpen: false,
};

class ConsoleError extends Error {}

export const sign = (): AppThunk => (dispatch, getState) => {
    dispatch(
        run(async (msgObj) => {
            const account = selectedAccount(getState());
            if (!account) throw new Error("No account selected");

            const signDoc = makeADR36AminoSignDoc(
                account.address,
                JSON.stringify(msgObj)
            );

            let stdSig: StdSignature;

            if (account.type === AccountType.Keplr) {
                const keplr = await getKeplr();
                const chainId = getState().connection.config["chainId"];

                stdSig = await keplr.signArbitrary(
                    chainId,
                    account.address,
                    JSON.stringify(msgObj)
                );
            } else if (account.type === AccountType.Basic) {
                const wallet = await Secp256k1HdWallet.fromMnemonic(
                    account.mnemonic,
                    {
                        prefix: getState().connection.config["addressPrefix"],
                    }
                );

                stdSig = (await wallet.signAmino(account.address, signDoc))
                    .signature;
            } else {
                throw new Error("Invalid account type");
            }

            const document = Buffer.from(serializeSignDoc(signDoc)).toString(
                "base64"
            );
            const {
                signature,
                pub_key: { value: pubkey },
            } = stdSig;
            return { document, signature, pubkey };
        })
    );
};

const run = createAsyncThunk(
    "console/run",
    async (
        command: (msgObj: any) => Promise<any>,
        { getState }
    ): Promise<string> => {
        let result = "";
        try {
            const msgObj = JSON.parse((getState() as RootState).console.input);
            const resObj = await command(msgObj);
            result = JSON.stringify(resObj, null, 2);
        } catch (e) {
            if (e instanceof SyntaxError) {
                throw new ConsoleError(`Invalid JSON: ${e.message}`);
            } else if (e instanceof Error) {
                throw new ConsoleError(`Error: ${e.message}`);
            } else {
                throw new ConsoleError(`Unknown error: ${e}`);
            }
        }

        return result;
    }
);

export const query = (): AppThunk => (dispatch, getState) => {
    dispatch(
        run(async (queryObj) => {
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

                const executeOptions = getState().console.executeOptions;
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

export const consoleSlice = createSlice({
    name: "console",
    initialState,
    reducers: {
        setInput: (state, action: PayloadAction<string>) => {
            state.input = action.payload;
        },
        setOutput: (state, action: PayloadAction<string>) => {
            state.output = action.payload;
        },
        setErrorOutput: (state, action: PayloadAction<string>) => {
            state.errorOutput = action.payload;
        },
        setExecuteOptions: (state, action: PayloadAction<ExecuteOptions>) => {
            state.executeOptions = action.payload;
        },
        setInstantiateOptions: (
            state,
            action: PayloadAction<InstantiateOptions | undefined>
        ) => {
            state.instantiateOptions = action.payload;
        },
        prettifyInput: (state, action: PayloadAction<string>) => {
            state.errorOutput = "";

            try {
                state.input = JSON.stringify(
                    JSON.parse(action.payload),
                    null,
                    2
                );
            } catch (e) {
                if (e instanceof SyntaxError) {
                    state.errorOutput = `Invalid JSON: ${e.message}`;
                } else if (e instanceof Error) {
                    state.errorOutput = `Error: ${e.message}`;
                }
            }
        },
        setOptionsOpen: (state, action: PayloadAction<boolean>) => {
            state.optionsOpen = action.payload;
        },
        setInstantiateOpen: (state, action: PayloadAction<boolean>) => {
            state.instantiateOpen = action.payload;
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
                state.output = action.error.message ?? "Error";
                state.error = true;
            });
    },
});

export const {
    setInput,
    setOutput,
    setErrorOutput,
    prettifyInput,
    setOptionsOpen,
    setInstantiateOpen,
    setExecuteOptions,
    setInstantiateOptions,
} = consoleSlice.actions;

export default consoleSlice.reducer;
