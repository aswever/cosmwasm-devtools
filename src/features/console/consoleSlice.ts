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

export interface ConsoleState {
  input: string;
  output: string;
  error: boolean;
  optionsOpen: boolean;
  executeOptions?: ExecuteOptions;
}

const initialState: ConsoleState = {
  input: "",
  output: "Response will appear here",
  error: false,
  optionsOpen: false,
};

class ConsoleError extends Error {}

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
      const client = await connectionManager.getQueryClient(
        getState().connection.config
      );
      return client.queryContractSmart(contract.address, queryObj);
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
                toMicroAmount(executeFunds, config["coinDecimals"]),
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
    setExecuteOptions: (state, action: PayloadAction<ExecuteOptions>) => {
      state.executeOptions = action.payload;
    },
    prettifyInput: (state, action: PayloadAction<string>) => {
      try {
        state.input = JSON.stringify(JSON.parse(action.payload), null, 2);
      } catch (e) {
        if (e instanceof SyntaxError) {
          state.output = `Invalid JSON: ${e.message}`;
        } else if (e instanceof Error) {
          state.output = `Error: ${e.message}`;
        }
      }
    },
    setOptionsOpen: (state, action: PayloadAction<boolean>) => {
      state.optionsOpen = action.payload;
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
  prettifyInput,
  setOptionsOpen,
  setExecuteOptions,
} = consoleSlice.actions;

export default consoleSlice.reducer;
