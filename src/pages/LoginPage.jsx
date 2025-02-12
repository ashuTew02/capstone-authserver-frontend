import React, { useEffect } from "react";
import { Button, Typography } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import "./loginPage.css";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

function LoginPage() {
  const handleGoogleLogin = () => {
    // Redirect to your backend for Google OAuth2
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="login-page">
      {/* Animated Gradient Background */}
      <div className="animated-bg"></div>

      {/* Some floating shapes or circles for extra flair (optional) */}
      <div className="floating-circles">
        <div className="circle circle1"></div>
        <div className="circle circle2"></div>
        <div className="circle circle3"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo */}
        <img src="/logo.png" alt="ArmorCode Logo" className="login-logo" />

        <Title level={2} className="login-title">
          Welcome to ArmorCode
        </Title>
        <p className="login-subtitle">Please sign in to continue</p>

        <Button
          className="google-login-btn"
          icon={<GoogleOutlined />}
          size="large"
          onClick={handleGoogleLogin}
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}

export default LoginPage;
