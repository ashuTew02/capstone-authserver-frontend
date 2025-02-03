import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./layoutStyles.css";

const { Content } = Layout;

function AppLayout() {
  return (
    <Layout className="app-layout">
      {/* Collapsible sidebar */}
      <Sidebar />

      {/* Main area */}
      <Layout className="layout-main">
        <Navbar />
        <Content className="layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AppLayout;
