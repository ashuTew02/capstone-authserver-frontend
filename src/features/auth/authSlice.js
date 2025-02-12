// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Only store the token in localStorage. We’ll refresh user/tenant data after login.
const storedToken = localStorage.getItem("accessToken");

const initialState = {
  token: storedToken || null,
  // user object from /auth/me (id, email, defaultTenantId, etc.)
  user: null,
  // The actively selected tenant (from the JWT)
  currentTenant: null, 
  // The list of all tenants the user belongs to
  allTenants: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user, currentTenant, allTenants } = action.payload;

      if (token !== undefined) {
        state.token = token;
        // Save/remove token in localStorage
        if (token) {
          localStorage.setItem("accessToken", token);
        } else {
          localStorage.removeItem("accessToken");
        }
      }

      if (user !== undefined) {
        state.user = user;
      }

      if (currentTenant !== undefined) {
        state.currentTenant = currentTenant;
      }

      if (allTenants !== undefined) {
        state.allTenants = allTenants;
      }
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.currentTenant = null;
      state.allTenants = [];

      localStorage.removeItem("accessToken");
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("accessToken", action.payload);
    },
    setCurrentTenant: (state, action) => {
      state.currentTenant = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
