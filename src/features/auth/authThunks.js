// src/features/auth/authThunks.js
import { setCredentials } from "./authSlice";
import { authApi } from "../../api/authApi";

// An async function to re-fetch the relevant user & tenant data
export const initializeAuthData = () => async (dispatch, getState) => {
  const token = getState().auth.token;
  if (!token) {
    // Not logged in
    return;
  }

  try {
    // 1) fetch user
    const userResult = await dispatch(
      authApi.endpoints.fetchCurrentUser.initiate()
    );
    if (userResult.isError) {
      console.error("Failed to fetch user data: ", userResult.error);
      return;
    }
    const user = userResult.data?.data; // Usually your "ApiResponse.data"

    // 2) fetch all tenants
    const tenantsResult = await dispatch(
      authApi.endpoints.getUserTenants.initiate()
    );
    if (tenantsResult.isError) {
      console.error("Failed to fetch user tenants: ", tenantsResult.error);
      return;
    }
    const allTenants = tenantsResult.data?.data || [];

    // 3) fetch current tenant
    const currentTenantResult = await dispatch(
      authApi.endpoints.getCurrentTenant.initiate()
    );
    if (currentTenantResult.isError) {
      console.error("Failed to fetch current tenant: ", currentTenantResult.error);
      return;
    }
    const currentTenant = currentTenantResult.data?.data;

    // 4) commit them to our Redux store
    dispatch(setCredentials({ 
      user, 
      allTenants, 
      currentTenant 
    }));
  } catch (err) {
    console.error("initializeAuthData error:", err);
  }
};
