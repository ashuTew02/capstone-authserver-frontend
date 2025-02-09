// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import { findingsApi } from "../api/findingsApi";
import { scanApi } from "../api/scanApi";

// 1) Import auth reducer
import authReducer from "../features/auth/authSlice";
import { authApi } from "../api/authApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,        // <---- Add this line
    [findingsApi.reducerPath]: findingsApi.reducer,
    [scanApi.reducerPath]: scanApi.reducer,
    [authApi.reducerPath]: authApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(findingsApi.middleware)
      .concat(scanApi.middleware)
      .concat(authApi.middleware)
});
