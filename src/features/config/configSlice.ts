import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { getClient } from "../../services/getClient";
import { pushMessage } from "../messages/messagesSlice";

export enum ConnectionState {
  Connecting = "connecting",
  Connected = "connected",
  Error = "error",
}

export interface ConfigState {
  entries: { [key: string]: string };
  modalOpen: boolean;
  connection: ConnectionState;
}

const initialState: ConfigState = {
  entries: {},
  modalOpen: false,
  connection: ConnectionState.Connecting,
};

export const checkConnection = createAsyncThunk<
  void,
  | {
      testing: boolean;
    }
  | undefined
>(
  "config/checkConnection",
  async (
    { testing } = { testing: false },
    { dispatch, getState }
  ): Promise<void> => {
    const state = getState() as RootState;
    const config = state.config.entries;

    dispatch(setConnectionState(ConnectionState.Connecting));
    try {
      await getClient(null, config, testing);
      dispatch(setConnectionState(ConnectionState.Connected));
      if (testing)
        dispatch(
          pushMessage({
            level: "success",
            message: `Successfully connected to ${config["chainName"]}`,
          })
        );
    } catch (e) {
      console.error(e);
      dispatch(setConnectionState(ConnectionState.Error));
      if (testing)
        dispatch(
          pushMessage({ level: "danger", message: "Connection failed" })
        );
    }
  }
);

export const configSlice = createSlice({
  name: "config",
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
    setConnectionState: (state, action: PayloadAction<ConnectionState>) => {
      state.connection = action.payload;
    },
  },
});

export const {
  setConfigModalOpen,
  setConfigEntry,
  setConfigEntries,
  setConnectionState,
} = configSlice.actions;

export default configSlice.reducer;
