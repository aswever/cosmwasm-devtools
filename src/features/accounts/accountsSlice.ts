import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { RootState } from "../../app/store";
import { configService } from "../../services/Config";

export interface BaseAccount {
  type: string;
  label: string;
  address: string;
}

export interface KeplrAccount extends BaseAccount {
  type: "keplr";
}

export interface StandardAccount extends BaseAccount {
  type: "standard";
  mnemonic: string;
}

export type Account = KeplrAccount | StandardAccount;

export interface AccountsState {
  accountList: { [key: string]: Account };
  keplrAccount?: Account;
  currentAccount?: string;
  status: "idle" | "loading" | "failed";
}

const initialState: AccountsState = {
  accountList: {},
  status: "idle",
};

export const importAccount = createAsyncThunk(
  "accounts/import",
  async ({
    label,
    mnemonic,
  }: {
    label: string;
    mnemonic: string;
  }): Promise<StandardAccount> => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: configService.get("addressPrefix"),
    });
    const [{ address }] = await wallet.getAccounts();
    return { label, mnemonic, address, type: "standard" };
  }
);

export const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    selectAccount: (state, action: PayloadAction<string | undefined>) => {
      state.currentAccount = action.payload;
    },
    deleteAccount: (state, action: PayloadAction<string>) => {
      delete state.accountList[action.payload];
    },
    setKeplrAccount: (state, action: PayloadAction<Account | undefined>) => {
      const account = action.payload;

      if (account) {
        state.accountList[account.address] = account;
      } else {
        delete state.accountList[state.keplrAccount!.address];
      }

      state.keplrAccount = account;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importAccount.pending, (state) => {
        state.status = "loading";
      })
      .addCase(importAccount.fulfilled, (state, action) => {
        state.status = "idle";
        const account = action.payload;
        state.accountList[account.address] = account;
      });
  },
});

export const { selectAccount, deleteAccount, setKeplrAccount } =
  accountsSlice.actions;

export const selectedAccount = (state: RootState) =>
  state.accounts.currentAccount !== undefined
    ? state.accounts.accountList[state.accounts.currentAccount]
    : undefined;

export const standardAccounts = (state: RootState) =>
  Object.values(state.accounts.accountList).filter(
    (account) => account.type === "standard"
  );

export default accountsSlice.reducer;
