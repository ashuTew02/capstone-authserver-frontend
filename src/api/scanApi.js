import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "./baseQueryWithAuth";

export const scanApi = createApi({
  reducerPath: "scanApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    postScan: builder.mutation({
      query: (body) => ({
        url: "/scan/request",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { usePostScanMutation } = scanApi;
