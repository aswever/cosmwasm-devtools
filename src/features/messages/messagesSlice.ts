import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Message {
  id?: number;
  level: "success" | "primary" | "neutral" | "warning" | "danger";
  header?: string;
  message: string;
}

export interface MessagesState {
  queue: Message[];
}

const initialState: MessagesState = {
  queue: [],
};

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    pushMessage: (state, action: PayloadAction<Message>) => {
      state.queue.push({ ...action.payload, id: Math.random() * 100000 });
    },
    shiftMessage: (state) => {
      state.queue.shift();
    },
  },
});

export const { pushMessage, shiftMessage } = messagesSlice.actions;

export default messagesSlice.reducer;
