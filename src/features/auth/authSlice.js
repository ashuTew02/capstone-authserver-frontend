// src/features/auth/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Helper to read from localStorage if present
const storedToken = localStorage.getItem("accessToken");
const storedRoles = localStorage.getItem("roles");
const parsedRoles = storedRoles ? storedRoles.split(",") : [];

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: storedToken || null,
    roles: parsedRoles || [],
    user: null, 
    // could store entire user object if you want
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, roles, user } = action.payload;
      state.token = token;
      state.roles = roles || [];
      state.user = user || null;

      // Persist to localStorage if desired
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }

      if (roles && roles.length > 0) {
        localStorage.setItem("roles", roles.join(","));
      } else {
        localStorage.removeItem("roles");
      }
    },
    clearCredentials: (state) => {
      state.token = null;
      state.roles = [];
      state.user = null;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("roles");
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
