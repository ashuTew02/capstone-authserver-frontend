// src/layouts/AppLayout.jsx

import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./layoutStyles.css";

const { Content } = Layout;

function AppLayout() {
  return (
    <Layout className="app-layout-wrapper">
      {/* Collapsible sidebar */}
      <Sidebar />

      {/* Main area */}
      <Layout className="layout-main">
        <Navbar />
        <Content className="layout-content">
          {/* All pages (Dashboard, Findings, Runbooks, Profile, etc.) render here */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
