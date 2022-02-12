import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { getClient } from "../../services/getClient";
import { AccountType, Contract } from "../accounts/accountsSlice";

export interface ContractsState {
  contractList: { [key: string]: Contract };
  currentContract?: string;
  status: "idle" | "loading" | "failed";
}

const initialState: ContractsState = {
  contractList: {},
  status: "idle",
};

export const addContract = createAsyncThunk(
  "contracts/add",
  async (address: string, { getState }): Promise<Contract> => {
    const state = getState() as RootState;
    const querier = await getClient(null, state.config.entries);
    const contract = await querier.client.getContract(address);

    /* broken method?
    let history;
    try {
      history = (await querier.client.getContractCodeHistory(
        address
      )) as ContractCodeHistoryEntry[];
    } catch (error) {
      console.error("failed to retrieve contract history", error);
    }
    */

    const { label } = contract;

    return { type: AccountType.Contract, address, label, contract };
  }
);

export const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    selectContract: (state, action: PayloadAction<string>) => {
      state.currentContract = action.payload;
    },
    deleteContract: (state, action: PayloadAction<string>) => {
      delete state.contractList[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addContract.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addContract.fulfilled, (state, action) => {
        state.status = "idle";
        const contract = action.payload;
        state.contractList[contract.address] = contract;
      });
  },
});

export const { selectContract, deleteContract } = contractsSlice.actions;

export const selectedContract = (state: RootState) =>
  state.contracts.currentContract !== undefined
    ? state.contracts.contractList[state.contracts.currentContract]
    : undefined;

export default contractsSlice.reducer;
