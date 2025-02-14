import { useState } from "react";
import { Layout, Menu } from "antd";
import { DashboardOutlined, FileSearchOutlined, UserOutlined } from "@ant-design/icons";
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
