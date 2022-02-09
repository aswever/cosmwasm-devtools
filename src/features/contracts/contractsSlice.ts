import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { getQuerier } from "../../services/Querier";
import { Contract, ContractCodeHistoryEntry } from "@cosmjs/cosmwasm-stargate";

export interface ContractInfo {
  contract: Contract;
  history?: ContractCodeHistoryEntry[];
}

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
  async (address: string) => {
    const querier = await getQuerier();
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

    return contract;
  }
);

export const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    selectContract: (state, action: PayloadAction<string>) => {
      state.currentContract = action.payload;
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

export const { selectContract } = contractsSlice.actions;

export const selectedContract = (state: RootState) =>
  state.contracts.currentContract !== undefined
    ? state.contracts.contractList[state.contracts.currentContract]
    : undefined;

export default contractsSlice.reducer;
