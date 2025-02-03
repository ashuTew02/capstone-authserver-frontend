import { configureStore } from "@reduxjs/toolkit";
import { findingsApi } from "../api/findingsApi";
import { scanApi } from "../api/scanApi";

export const store = configureStore({
  reducer: {
    [findingsApi.reducerPath]: findingsApi.reducer,
    [scanApi.reducerPath]: scanApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(findingsApi.middleware)
      .concat(scanApi.middleware),
});
