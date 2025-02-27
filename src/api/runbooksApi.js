// src/api/runbooksApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "./baseQueryWithAuth";

export const runbooksApi = createApi({
  reducerPath: "runbooksApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Runbooks"],
  endpoints: (builder) => ({
    // 1) GET all runbooks
    getTenantRunbooks: builder.query({
      query: () => "/api/runbooks",
      providesTags: ["Runbooks"],
    }),

    // 2) CREATE runbook
    createRunbook: builder.mutation({
      query: (body) => ({
        url: "/api/runbooks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Runbooks"],
    }),

    // 3) GET runbook by ID
    getRunbookById: builder.query({
      query: (id) => `/api/runbooks/${id}/detail`,
      providesTags: (result, error, id) => [{ type: "Runbooks", id }],
    }),

    // 4) Check runbook status
    getRunbookStatus: builder.query({
      query: (id) => `/api/runbooks/${id}/status`,
      providesTags: (result, error, id) => [{ type: "Runbooks", id }],
    }),

    // 5) Configure triggers (no config field)
    configureTriggers: builder.mutation({
      query: ({ runbookId, triggers }) => ({
        url: `/api/runbooks/${runbookId}/triggers`,
        method: "POST",
        body: {
          runbookId,
          triggers, // each trigger has only { triggerType }
        },
      }),
      invalidatesTags: (result, error, { runbookId }) => [
        "Runbooks",
        { type: "Runbooks", id: runbookId },
      ],
    }),

    getRunbookTriggers: builder.query({
      query: (id) => `/api/runbooks/${id}/triggers`,
      providesTags: (result, error, id) => [{ type: "Runbooks", id }],
    }),

    // 6) Get all available triggers
    getAllAvailableTriggers: builder.query({
      query: () => `/api/runbooks/triggers/available`,
    }),

    // 7) Configure filters
    configureFilters: builder.mutation({
      query: ({ runbookId, state, severity }) => ({
        url: `/api/runbooks/${runbookId}/filters`,
        method: "POST",
        body: { runbookId, state, severity },
      }),
      invalidatesTags: (result, error, { runbookId }) => [
        "Runbooks",
        { type: "Runbooks", id: runbookId },
      ],
    }),

    getRunbookFilters: builder.query({
      query: (id) => `/api/runbooks/${id}/filters`,
      providesTags: (result, error, id) => [{ type: "Runbooks", id }],
    }),

    // 8) Configure actions (remove fromState; keep only toState, ticketCreate)
    configureActions: builder.mutation({
      query: ({ runbookId, update, ticketCreate }) => ({
        url: `/api/runbooks/${runbookId}/actions`,
        method: "POST",
        body: { runbookId, update, ticketCreate },
      }),
      invalidatesTags: (result, error, { runbookId }) => [
        "Runbooks",
        { type: "Runbooks", id: runbookId },
      ],
    }),

    getRunbookActions: builder.query({
      query: (id) => `/api/runbooks/${id}/actions`,
      providesTags: (result, error, id) => [{ type: "Runbooks", id }],
    }),

    // 9) Enable/disable runbook
    updateRunbookEnabled: builder.mutation({
      query: ({ id, enabled }) => ({
        url: `/api/runbooks/${id}/enabled?enabled=${enabled}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { id }) => [
        "Runbooks",
        { type: "Runbooks", id },
      ],
    }),

    // 10) Delete runbook
    deleteRunbook: builder.mutation({
      query: (id) => ({
        url: `/api/runbooks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Runbooks"],
    }),
  }),
});

export const {
  useGetTenantRunbooksQuery,
  useCreateRunbookMutation,
  useGetRunbookByIdQuery,
  useGetRunbookStatusQuery,
  useConfigureTriggersMutation,
  useGetRunbookTriggersQuery,
  useGetAllAvailableTriggersQuery,
  useConfigureFiltersMutation,
  useGetRunbookFiltersQuery,
  useConfigureActionsMutation,
  useGetRunbookActionsQuery,
  useUpdateRunbookEnabledMutation,
  useDeleteRunbookMutation,
} = runbooksApi;
