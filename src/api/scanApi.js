import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const scanApi = createApi({
  reducerPath: "scanApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8081/scan",
  }),
  endpoints: (builder) => ({
    postScan: builder.mutation({
      query: (body) => ({
        url: "/request",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { usePostScanMutation } = scanApi;
