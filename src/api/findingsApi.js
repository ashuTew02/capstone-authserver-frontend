import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "./baseQueryWithAuth";

export const findingsApi = createApi({
  reducerPath: "findingsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Finding"],
  endpoints: (builder) => ({
    // ============ GET /findings with multiple param arrays ============
    getFindings: builder.query({
      query: ({ severity = [], state = [], toolType = [], page = 0, size = 10 }) => {
        const params = new URLSearchParams();
        severity.forEach((s) => params.append("severity", s));
        state.forEach((st) => params.append("state", st));
        toolType.forEach((t) => params.append("toolType", t));
        params.set("page", page);
        params.set("size", size);
        return { url: `/findings?${params.toString()}`, method: "GET" };
      },
      providesTags: ["Finding"],
    }),

    // ============ GET /finding?id=... =============
    getFindingById: builder.query({
      query: (id) => ({ url: "/finding", params: { id } }),
      providesTags: ["Finding"],
    }),

    // ============ GET /findings/severity =============
    getSeverities: builder.query({
      query: () => "/findings/severity",
    }),
    // ============ GET /findings/state =============
    getStates: builder.query({
      query: () => "/findings/state",
    }),
    // ============ GET /tool =============
    getToolTypes: builder.query({
      query: () => "/tool",
    }),

    // ============ PATCH /api/github/alert =============
    updateState: builder.mutation({
      query: (body) => ({
        url: "/api/github/alert",
        method: "PATCH",
        body,
      }),
    }),

    // ============ Dashboard endpoints =============
    getToolDistribution: builder.query({
      // GET /dashboard/toolDistribution
      query: () => "/dashboard/toolDistribution",
    }),
    getSeverityDistribution: builder.query({
      // e.g. /dashboard/severityDistribution?tool=CODE_SCAN&tool=DEPENDABOT
      query: (tools = []) => {
        const params = new URLSearchParams();
        tools.forEach((t) => params.append("tool", t));
        return `/dashboard/severityDistribution?${params.toString()}`;
      },
    }),
    getStateDistribution: builder.query({
      query: (tools = []) => {
        const params = new URLSearchParams();
        tools.forEach((t) => params.append("tool", t));
        return `/dashboard/stateDistribution?${params.toString()}`;
      },
    }),
    getCvssDistribution: builder.query({
      query: (tools = []) => {
        const params = new URLSearchParams();
        tools.forEach((t) => params.append("tool", t));
        return `/dashboard/cvssDistribution?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useGetFindingsQuery,
  useGetFindingByIdQuery,
  useGetSeveritiesQuery,
  useGetStatesQuery,
  useGetToolTypesQuery,
  useUpdateStateMutation,
  useGetToolDistributionQuery,
  useGetSeverityDistributionQuery,
  useGetStateDistributionQuery,
  useGetCvssDistributionQuery,
} = findingsApi;
