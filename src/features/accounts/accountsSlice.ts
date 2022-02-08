import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { RootState } from "../../app/store";

export interface Account {
  mnemonic: string;
  address: string;
}

export interface AccountsState {
  accountList: Account[];
  currentAccount?: number;
  status: "idle" | "loading" | "failed";
}

const initialState: AccountsState = {
  accountList: [],
  status: "idle",
};

export const generateAccount = createAsyncThunk(
  "accounts/generate",
  async () => {
    const wallet = await DirectSecp256k1HdWallet.generate();
    const { mnemonic } = wallet;
    const [{ address }] = await wallet.getAccounts();
    return { mnemonic, address };
  }
);

export const importAccount = createAsyncThunk(
  "accounts/import",
  async (mnemonic: string) => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
    const [{ address }] = await wallet.getAccounts();
    return { mnemonic, address };
  }
);

export const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    selectAccount: (state, action: PayloadAction<number>) => {
      state.currentAccount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateAccount.pending, (state) => {
        state.status = "loading";
      })
      .addCase(generateAccount.fulfilled, (state, action) => {
        state.status = "idle";
        state.accountList.push(action.payload);
      })
      .addCase(importAccount.pending, (state) => {
        state.status = "loading";
      })
      .addCase(importAccount.fulfilled, (state, action) => {
        state.status = "idle";
        state.accountList.push(action.payload);
      });
  },
});

export const { selectAccount } = accountsSlice.actions;

export const selectedAccount = (state: RootState) =>
  state.accounts.currentAccount !== undefined
    ? state.accounts.accountList[state.accounts.currentAccount]
    : undefined;

export default accountsSlice.reducer;
