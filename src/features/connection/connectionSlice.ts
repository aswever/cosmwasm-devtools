import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";
import { pushMessage } from "../messages/messagesSlice";
import connectionManager from "./connectionManager";
import presets from "./presets.json";

export enum ConnectionStatus {
  Connecting = "connecting",
  Connected = "connected",
  Error = "error",
}

export interface ConnectionState {
  config: { [key: string]: string };
  modalOpen: boolean;
  status: ConnectionStatus;
}

const initialState: ConnectionState = {
  config: presets["juno-uni"],
  modalOpen: false,
  status: ConnectionStatus.Connecting,
};

export const checkConnection = createAsyncThunk<
  void,
  | {
      testing: boolean;
    }
  | undefined
>(
  "connection/checkConnection",
  async (
    { testing } = { testing: false },
    { dispatch, getState }
  ): Promise<void> => {
    const state = getState() as RootState;
    const config = state.connection.config;

    dispatch(setConnectionStatus(ConnectionStatus.Connecting));
    try {
      await connectionManager.getQueryClient(config, testing);
      dispatch(setConnectionStatus(ConnectionStatus.Connected));
      if (testing)
        dispatch(
          pushMessage({
            status: "success",
            message: `Successfully connected to ${config["chainName"]}`,
          })
        );
    } catch (e) {
      console.error(e);
      dispatch(setConnectionStatus(ConnectionStatus.Error));
      if (testing)
        dispatch(
          pushMessage({ status: "danger", message: "Connection failed" })
        );
    }
  }
);

export const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setConfigModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
    },
    setConnectionConfigItem: (
      state,
      action: PayloadAction<{ key: string; value: string }>
    ) => {
      state.config[action.payload.key] = action.payload.value;
    },
    setConnectionConfig: (
      state,
      action: PayloadAction<{ [key: string]: string }>
    ) => {
      state.config = action.payload;
    },
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.status = action.payload;
    },
  },
});

export const {
  setConfigModalOpen,
  setConnectionConfigItem,
  setConnectionConfig,
  setConnectionStatus,
} = connectionSlice.actions;

export default connectionSlice.reducer;
