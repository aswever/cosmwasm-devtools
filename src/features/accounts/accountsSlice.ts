import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { RootState } from "../../app/store";
import { configService } from "../../services/Config";
import { Contract as CosmWasmContract } from "@cosmjs/cosmwasm-stargate";
import { ClientType, getClient } from "../../services/getClient";
import { toMicroCoin } from "../../util/coins";

export enum AccountType {
  Basic,
  Keplr,
  Contract,
}

export interface BaseAccount {
  type: AccountType;
  label: string;
  address: string;
}

export interface KeplrAccount extends BaseAccount {
  type: AccountType.Keplr;
}

export interface BasicAccount extends BaseAccount {
  type: AccountType.Basic;
  mnemonic: string;
}

export interface Contract extends BaseAccount {
  type: AccountType.Contract;
  contract: CosmWasmContract;
}

export type Account = KeplrAccount | BasicAccount | Contract;

export interface AccountsState {
  accountList: { [key: string]: Account };
  keplrAccount?: Account;
  currentAccount?: string;
  status: "idle" | "loading" | "failed";
  messages: string[];
}

const initialState: AccountsState = {
  accountList: {},
  status: "idle",
  messages: [],
};

export const importAccount = createAsyncThunk(
  "accounts/import",
  async ({
    label,
    mnemonic,
  }: {
    label: string;
    mnemonic: string;
  }): Promise<BasicAccount> => {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: configService.get("addressPrefix"),
    });
    const [{ address }] = await wallet.getAccounts();
    return { label, mnemonic, address, type: AccountType.Basic };
  }
);

export const sendCoins = createAsyncThunk(
  "accounts/sendCoins",
  async (
    {
      sender,
      recipient,
      amount,
      memo,
    }: {
      sender: string;
      recipient: string;
      amount: string;
      memo?: string;
    },
    { getState }
  ): Promise<boolean> => {
    const state = getState() as RootState;
    const senderAccount = state.accounts.accountList[sender];
    const connection = await getClient(senderAccount);
    if (connection.clientType !== ClientType.Signing) {
      throw new Error("Client is not a signing client");
    }

    const coinsAmount = [
      toMicroCoin({ amount, denom: configService.get("coinName") }),
    ];

    const response = await connection.client.sendTokens(
      sender,
      recipient,
      coinsAmount,
      "auto",
      memo
    );
    console.log(JSON.stringify(response));
    return response.code === 0;
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
      })
      .addCase(sendCoins.pending, (state) => {
        state.messages.push("sending coins...");
      })
      .addCase(sendCoins.fulfilled, (state, success) => {
        if (success) {
          state.messages.push("coins sent");
        } else {
          state.messages.push("failed to send coins");
        }
      })
      .addCase(sendCoins.rejected, (state) => {
        state.messages.push("error sending coins");
      });
  },
});

export const { selectAccount, deleteAccount, setKeplrAccount } =
  accountsSlice.actions;

export const selectedAccount = (state: RootState) =>
  state.accounts.currentAccount !== undefined
    ? state.accounts.accountList[state.accounts.currentAccount]
    : undefined;

export const basicAccounts = (state: RootState) =>
  Object.values(state.accounts.accountList).filter(
    (account) => account.type === AccountType.Basic
  );

export default accountsSlice.reducer;
