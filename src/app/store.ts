import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import accountsReducer from "../features/accounts/accountsSlice";
import contractsReducer from "../features/contracts/contractsSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    accounts: accountsReducer,
    contracts: contractsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
