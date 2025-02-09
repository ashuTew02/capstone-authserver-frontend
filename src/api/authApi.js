// src/features/auth/AuthApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../api/baseQueryWithAuth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    fetchCurrentUser: builder.query({
      query: () => "/auth/me", // GET
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const { useFetchCurrentUserQuery, 
  useLogoutUserMutation, 
  useLazyFetchCurrentUserQuery, } = authApi;
