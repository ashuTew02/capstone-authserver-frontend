// src/pages/OAuth2SuccessPage.jsx

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// NOTE: We'll revert to the default import (since jwt-decode typically exports as default).
// import jwtDecode from "jwt-decode";
import { setCredentials } from "../features/auth/authSlice";
import { useLazyFetchCurrentUserQuery } from "../api/authApi";

function OAuth2SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // We will lazily call /auth/me after we set the token
  const [triggerFetchMe, { data: userResponse, isSuccess, isError }] =
    useLazyFetchCurrentUserQuery();

  // Local state to hold the token once we parse it
  const [token, setToken] = useState(null);

  useEffect(() => {
    const t = searchParams.get("token");
    if (!t) {
      // If no token, go to login
      navigate("/login");
      return;
    }
    // 1) Parse token (optional if you want to check its claims)
    // try {
    //   const decoded = jwtDecode(t);
    //   console.log("Decoded token:", decoded);
    //   // We won't parse roles from token anymore, because we'll fetch from /auth/me
    // } catch (error) {
    //   console.error("Error decoding token:", error);
    // }
    // 2) Store token in Redux with empty roles for now
    dispatch(setCredentials({ token: t, roles: [], user: null }));
    setToken(t);
  }, [searchParams, dispatch, navigate]);

  // Once we have the token set, call /auth/me
  useEffect(() => {
    if (token) {
      // Fire the lazy query to /auth/me
      triggerFetchMe();
    }
  }, [token, triggerFetchMe]);

  // If the query to /auth/me succeeds, store the user + roles in Redux, then navigate
  useEffect(() => {
    if (isSuccess && userResponse) {
      const userData = userResponse.data;
      if (!userData) {
        // if there's no data in the response, go to login
        navigate("/login");
        return;
      }

      // Extract roles from userData
      // userData.roles is an array like [{id:1, name:'USER'}]
      const roles = (userData.roles || []).map((r) => r.name);

      // Dispatch them to auth
      dispatch(
        setCredentials({
          token,
          roles,
          user: userData,
        })
      );

      // Go to dashboard
      navigate("/dashboard");
    }
  }, [isSuccess, userResponse, token, dispatch, navigate]);

  // If there's an error fetching me, send them to login (or show an error)
  useEffect(() => {
    if (isError) {
      console.error("Failed to fetch /auth/me. Redirecting to /login.");
      navigate("/login");
    }
  }, [isError, navigate]);

  return <div>Processing OAuth2 success...</div>;
}

export default OAuth2SuccessPage;
