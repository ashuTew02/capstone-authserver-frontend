// src/features/auth/AuthApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithAuth from "../api/baseQueryWithAuth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    // 1) Basic user info
    fetchCurrentUser: builder.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    // 2) Logout user
    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    // 3) Current tenant
    getCurrentTenant: builder.query({
      query: () => "/api/user/tenant/current",
      providesTags: ["Auth"],
    }),

    // 4) All tenants for the user
    getUserTenants: builder.query({
      query: () => "/api/user/tenants",
      providesTags: ["Auth"],
    }),

    switchTenant: builder.mutation({
      query: (tenantId) => ({
        url: "/api/user/tenant/switch",
        method: "GET", // or "POST" if you prefer
        params: { tenantId },
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useFetchCurrentUserQuery,
  useLogoutUserMutation,
  useGetCurrentTenantQuery,
  useGetUserTenantsQuery,
  useSwitchTenantMutation,
  // ...
} = authApi;
