// src/layouts/Sidebar.jsx

import { useState } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FileSearchOutlined,
  UserOutlined,
  ProfileOutlined, 
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import "./layoutStyles.css";

const { Sider } = Layout;

function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(val) => setCollapsed(val)}
      className="sidebar-sider"
      collapsedWidth={80}
      breakpoint="lg"
    >
      {/* Sidebar logo section */}
      <div className="sidebar-logo">
        <img
          src="/logo.webp"
          alt="Logo"
          style={{
            width: collapsed ? "40px" : "120px",
          }}
        />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ background: "transparent", border: "none" }}
      >
        <Menu.Item
          key="/dashboard"
          icon={<DashboardOutlined />}
          className="sidebar-menu-item"
        >
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>

        <Menu.Item
          key="/findings"
          icon={<FileSearchOutlined />}
          className="sidebar-menu-item"
        >
          <Link to="/findings">Findings</Link>
        </Menu.Item>

        {/* Tickets menu item */}
        <Menu.Item
          key="/tickets"
          icon={<ProfileOutlined />}
          className="sidebar-menu-item"
        >
          <Link to="/tickets">Tickets</Link>
        </Menu.Item>

        <Menu.Item
          key="/runbooks"
          icon={<FileSearchOutlined className="sidebar-menu-item"/>}
          className="sidebar-menu-item"
        >
          <Link to="/runbooks">Runbooks</Link>
        </Menu.Item>

        <Menu.Item
          key="/profile"
          icon={<UserOutlined />}
          className="sidebar-menu-item"
        >
          <Link to="/profile">Profile</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}

export default Sidebar;
