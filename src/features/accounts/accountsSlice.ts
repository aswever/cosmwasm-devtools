import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { coin, Coin, DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { RootState } from "../../app/store";
import { Contract as CosmWasmContract } from "@cosmjs/cosmwasm-stargate";
import { fromMicroCoin, toMicroAmount } from "../../util/coins";
import { pushMessage } from "../messages/messagesSlice";
import { FaucetClient } from "@cosmjs/faucet-client";
import connectionManager from "../connection/connectionManager";

export enum AccountType {
  Basic,
  Keplr,
  Contract,
}

export interface BaseAccount {
  type: AccountType;
  label: string;
  address: string;
  balance: Coin;
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
  exists: boolean;
}

export type Account = KeplrAccount | BasicAccount | Contract;

export interface AccountsState {
  accountList: { [key: string]: Account };
  keplrAccount?: Account;
  currentAccount?: string;
  currentContract?: string;
  sendCoinsOpen: boolean;
  donationOpen: boolean;
}

const initialState: AccountsState = {
  accountList: {},
  sendCoinsOpen: false,
  donationOpen: false,
};

export const importAccount = createAsyncThunk(
  "accounts/import",
  async (
    {
      label,
      mnemonic,
    }: {
      label: string;
      mnemonic: string;
    },
    { getState, dispatch }
  ): Promise<BasicAccount> => {
    const state = getState() as RootState;
    const config = state.connection.config;
    try {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: config["addressPrefix"],
      });
      const [{ address }] = await wallet.getAccounts();
      return {
        label,
        mnemonic,
        address,
        type: AccountType.Basic,
        balance: coin(0, config["microDenom"]),
      };
    } catch (e) {
      dispatch(
        pushMessage({
          status: "danger",
          header: "Failed to add account",
          message: e instanceof Error ? e.message : JSON.stringify(e),
        })
      );

      throw e;
    }
  }
);

export const checkContract = createAsyncThunk(
  "accounts/checkContract",
  async (
    account: Contract,
    { getState }
  ): Promise<Partial<Contract> | null> => {
    const state = getState() as RootState;
    const config = state.connection.config;
    const client = await connectionManager.getQueryClient(config);
    try {
      const contract = await client.getContract(account.address);
      const { label } = contract;

      if (label !== account.label || !account.exists) {
        return {
          label,
          exists: true,
        };
      }

      return null;
    } catch (e) {
      return {
        exists: false,
      };
    }
  }
);

export const importContract = createAsyncThunk(
  "accounts/importContract",
  async (address: string, { getState, dispatch }): Promise<Contract> => {
    const state = getState() as RootState;
    const config = state.connection.config;
    const client = await connectionManager.getQueryClient(config);
    try {
      const contract = await client.getContract(address);
      const { label } = contract;

      return {
        type: AccountType.Contract,
        address,
        label,
        contract,
        balance: coin(0, config["microDenom"]),
        exists: true,
      };
    } catch (e) {
      dispatch(
        pushMessage({
          status: "danger",
          header: "Failed to add contract",
          message: e instanceof Error ? e.message : JSON.stringify(e),
        })
      );

      throw e;
    }
  }
);

export const checkBalance = createAsyncThunk(
  "accounts/checkBalance",
  async (address: string, { getState }): Promise<Coin> => {
    const state = getState() as RootState;
    const config = state.connection.config;
    const denom: string = config["microDenom"];
    const client = await connectionManager.getQueryClient(config);
    return client.getBalance(address, denom);
  }
);

export const hitFaucet = createAsyncThunk(
  "accounts/hitFaucet",
  async (address: string, { getState, dispatch }): Promise<void> => {
    const state = getState() as RootState;
    const config = state.connection.config;
    const faucet = new FaucetClient(config["faucetEndpoint"]);
    dispatch(
      pushMessage({
        status: "neutral",
        message: "Requesting faucet funds...",
      })
    );
    try {
      await faucet.credit(address, config["microDenom"]);
      dispatch(
        pushMessage({
          status: "success",
          message: "Successfully requested funds from faucet",
        })
      );
      dispatch(checkBalance(address));
    } catch (e) {
      console.error(e);
      dispatch(
        pushMessage({
          status: "danger",
          header: "Error requesting funds from faucet",
          message: e instanceof Error ? e.message : JSON.stringify(e),
        })
      );
    }
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
      customConfig,
    }: {
      sender: string;
      recipient: string;
      amount: string;
      memo?: string;
      customConfig?: { [key: string]: string };
    },
    { getState, dispatch }
  ): Promise<void> => {
    try {
      const state = getState() as RootState;
      const config = customConfig ?? state.connection.config;
      const senderAccount = state.accounts.accountList[sender];

      console.log(sender, senderAccount);
      if (!sender) {
        throw new Error("No account selected");
      }

      const client = await connectionManager.getSigningClient(
        senderAccount,
        config
      );

      const coinsAmount = [
        {
          amount: toMicroAmount(amount, config["coinDecimals"]),
          denom: config["microDenom"],
        },
      ];

      const { code } = await client.sendTokens(
        sender,
        recipient,
        coinsAmount,
        "auto",
        memo
      );

      if (code !== 0) throw new Error("Transaction failed");

      dispatch(
        pushMessage({
          status: "success",
          message: "Coins sent successfully",
        })
      );
    } catch (e) {
      console.error(e);
      dispatch(
        pushMessage({
          status: "danger",
          header: "Error sending coins",
          message: e instanceof Error ? e.message : JSON.stringify(e),
        })
      );
    }
  }
);

export const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    selectAccount: (state, action: PayloadAction<string | undefined>) => {
      state.currentAccount = action.payload;
    },
    selectContract: (state, action: PayloadAction<string | undefined>) => {
      state.currentContract = action.payload;
    },
    deleteAccount: (state, action: PayloadAction<string>) => {
      delete state.accountList[action.payload];
    },
    setKeplrAccount: (
      state,
      action: PayloadAction<KeplrAccount | undefined>
    ) => {
      const account = action.payload;

      if (account) {
        state.accountList[account.address] = account;
        state.currentAccount = account.address;
      } else {
        if (
          state.currentAccount &&
          state.accountList[state.currentAccount]?.type === AccountType.Keplr
        ) {
          state.currentAccount = undefined;
        }
        delete state.accountList[state.keplrAccount!.address];
      }

      state.keplrAccount = account;
    },
    setAccountBalance: (
      state,
      action: PayloadAction<{ address: string; balance: Coin }>
    ) => {
      const { address, balance } = action.payload;
      const account = state.accountList[address];
      if (account) {
        account.balance = balance;
      }
    },
    setSendCoinsOpen: (state, action: PayloadAction<boolean>) => {
      state.sendCoinsOpen = action.payload;
    },
    setDonationOpen: (state, action: PayloadAction<boolean>) => {
      state.donationOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importAccount.fulfilled, (state, action) => {
        const account = action.payload;
        state.accountList[account.address] = account;
        if (!state.currentAccount) {
          state.currentAccount = account.address;
        }
      })
      .addCase(checkBalance.fulfilled, (state, action) => {
        const address = action.meta.arg;
        const balance = action.payload;
        const account = state.accountList[address];
        if (account) {
          account.balance = balance;
        }
      })
      .addCase(importContract.fulfilled, (state, action) => {
        const account = action.payload;
        state.accountList[account.address] = account;
        if (!state.currentContract) {
          state.currentContract = account.address;
        }
      })
      .addCase(checkContract.fulfilled, (state, action) => {
        const newAccountInfo = action.payload;
        const account = action.meta.arg;
        if (newAccountInfo && state.accountList[account.address]) {
          state.accountList[account.address] = {
            ...account,
            ...newAccountInfo,
          };
          if (
            !newAccountInfo.exists &&
            state.currentContract === account.address
          ) {
            state.currentContract = undefined;
          }
        }
      });
  },
});

export const {
  selectAccount,
  selectContract,
  deleteAccount,
  setKeplrAccount,
  setAccountBalance,
  setSendCoinsOpen,
  setDonationOpen,
} = accountsSlice.actions;

export const selectedAccount = (state: RootState) =>
  state.accounts.currentAccount !== undefined
    ? state.accounts.accountList[state.accounts.currentAccount]
    : undefined;

export const balanceString = (address?: string) => (state: RootState) => {
  const config = state.connection.config;
  if (!address) return `0${config["microDenom"]}`;

  const account = state.accounts.accountList[address];
  const balance = fromMicroCoin(account.balance, config["coinDecimals"]);
  return `${balance.amount}${balance.denom}`;
};

export const selectedContract = (state: RootState) =>
  state.accounts.currentContract !== undefined
    ? state.accounts.accountList[state.accounts.currentContract]
    : undefined;

export const basicAccounts = (state: RootState) =>
  Object.values(state.accounts.accountList).filter(
    (account) => account.type === AccountType.Basic
  );

export const contractAccounts = (state: RootState) =>
  Object.values(state.accounts.accountList).filter(
    (account) => account.type === AccountType.Contract
  ) as Contract[];

export default accountsSlice.reducer;
