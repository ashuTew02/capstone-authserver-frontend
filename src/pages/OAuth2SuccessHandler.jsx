import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';  // Import useSearchParams
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice'; // Import your Redux action

const OAuth2SuccessHandler = () => {
  const [searchParams] = useSearchParams(); // Get query parameters
  const token = searchParams.get('token'); // Extract the token
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      console.log("Token from OAuth2 redirect:", token);

      // Here you would typically fetch user details and roles using the token
      // and then dispatch the setCredentials action.  For this example,
      // we'll just dispatch a placeholder:

      // Example using localStorage:
      localStorage.setItem('token', token);

      // In a real application, you'd make an API call to get user info.
      // For this example, we'll just dispatch a placeholder:
      dispatch(setCredentials({ token, user: { name: "OAuth User" }, roles: ["USER"] }));

      navigate('/dashboard'); // Redirect to dashboard or wherever you want
    } else {
      // Handle the case where there's no token (e.g., error)
      console.error("No token received from OAuth2 redirect.");
      navigate('/login'); // Redirect to login
    }
  }, [token, navigate, dispatch]); // Add navigate and dispatch to the dependency array

  return (
    <div>
      {/* You can show a loading message or something while processing the token */}
      <h1>Processing OAuth2 Login...</h1>
    </div>
  );
};

export default OAuth2SuccessHandler;