import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const findingsApi = createApi({
  reducerPath: "findingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8081",
  }),
  endpoints: (builder) => ({
    getFindings: builder.query({
      query: ({
        severity = [],
        state = [],
        toolType = [],
        page = 0,
        size = 10,
      }) => {
        const params = new URLSearchParams();

        // Append each severity
        severity.forEach((s) => params.append("severity", s));
        // Append each state
        state.forEach((st) => params.append("state", st));
        // Append each toolType
        toolType.forEach((t) => params.append("toolType", t));

        params.set("page", page);
        params.set("size", size);

        return { url: `/findings?${params.toString()}`, method: "GET" };
      },
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
    updateState: builder.mutation({
      query: (body) => ({
        url: "/api/github/alert",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetFindingsQuery,
  useGetSeveritiesQuery,
  useGetStatesQuery,
  useGetToolTypesQuery,
  useGetFindingByIdQuery,

  useUpdateStateMutation,
} = findingsApi;
