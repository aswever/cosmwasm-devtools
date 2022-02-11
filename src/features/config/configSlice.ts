import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface ContractsState {
  entries: { [key: string]: string };
  modalOpen: boolean;
}

const initialState: ContractsState = {
  entries: {},
  modalOpen: false,
};

export const contractsSlice = createSlice({
  name: "contracts",
  initialState,
  reducers: {
    setConfigModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
    },
    setConfigEntry: (
      state,
      action: PayloadAction<{ key: string; value: string }>
    ) => {
      state.entries[action.payload.key] = action.payload.value;
    },
    setConfigEntries: (
      state,
      action: PayloadAction<{ [key: string]: string }>
    ) => {
      state.entries = action.payload;
    },
  },
});

export const { setConfigModalOpen, setConfigEntry, setConfigEntries } =
  contractsSlice.actions;

export const configSelector = (state: RootState) => (key: string) =>
  state.config.entries[key];

export default contractsSlice.reducer;
