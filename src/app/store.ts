import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import accountsReducer from "../features/accounts/accountsSlice";
import configReducer from "../features/config/configSlice";
import messagesReducer from "../features/messages/messagesSlice";

const persistConfig = {
  key: "root",
  storage,
};

const reducer = persistReducer(
  persistConfig,
  combineReducers({
    accounts: accountsReducer,
    config: configReducer,
    messages: messagesReducer,
  })
);

export const store = configureStore({
  reducer,
  middleware: (mw) => mw({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
