import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const findingsApi = createApi({
  reducerPath: "findingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8081",
  }),
  endpoints: (builder) => ({
    getFindings: builder.query({
      // GET /findings?toolType=...&severity=...&state=...&page=...&size=...
      query: ({ toolType, severity, state, page = 0, size = 10 }) => ({
        url: "/findings",
        params: {
          toolType,
          severity,
          state,
          page,
          size,
        },
      }),
    }),
    getFindingById: builder.query({
      // GET /findings/:id
      query: (id) => ({ url: "/finding", params: { id } }),
    }),
    getSeverities: builder.query({
      // GET /findings/severity
      query: () => "/findings/severity",
    }),
    getStates: builder.query({
      // GET /findings/state
      query: () => "/findings/state",
    }),
    getToolTypes: builder.query({
      // GET /tool
      query: () => "/tool",
    }),
  }),
});

export const {
  useGetFindingsQuery,
  useGetSeveritiesQuery,
  useGetStatesQuery,
  useGetToolTypesQuery,
  useGetFindingByIdQuery,
} = findingsApi;
