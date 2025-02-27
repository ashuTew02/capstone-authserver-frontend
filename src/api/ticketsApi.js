// src/api/ticketsApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "./baseQueryWithAuth";

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Ticket"],
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: () => "/tickets", // GET /tickets
      providesTags: ["Ticket"],
    }),
    getTicketById: builder.query({
      query: (ticketId) => `/tickets/${ticketId}`, // GET /tickets/{ticketId}
      providesTags: ["Ticket"],
    }),
    createTicket: builder.mutation({
      query: (body) => ({
        url: "/tickets/create", // POST /tickets/create
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ticket"],
    }),
    markTicketDone: builder.mutation({
      query: ({ticketId, findingId}) => ({
        url: `/tickets/${findingId}/${ticketId}/done`, // PUT /tickets/{ticketId}/done
        method: "PUT",
      }),
      invalidatesTags: ["Ticket"],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useMarkTicketDoneMutation,
} = ticketsApi;
