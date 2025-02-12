// src/pages/OAuth2SuccessPage.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { initializeAuthData } from "../features/auth/authThunks";

function OAuth2SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      // If no token present, send user to login
      navigate("/login");
      return;
    }

    // 1) Store the new token in Redux (we'll fetch user & tenant data next)
    dispatch(setCredentials({ token }));

    // 2) Re-init the user data, which calls /auth/me, /api/user/tenant/current, etc.
    dispatch(initializeAuthData()).then(() => {
      // 3) Once done, navigate to the dashboard (or wherever you want)
      navigate("/dashboard");
    });
  }, [dispatch, navigate, searchParams]);

  return <div>Processing OAuth2 success...</div>;
}

export default OAuth2SuccessPage;
