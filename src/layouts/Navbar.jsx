import React, { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Select,
  Button,
  message,
  Drawer,
  Avatar,
  Dropdown,
  Menu,
} from "antd";
import {
  SearchOutlined,
  MenuOutlined,
  CloseOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { clearCredentials, setCredentials } from "../features/auth/authSlice";
import { findingsApi } from "../api/findingsApi";
import {
  authApi,
  useGetUserTenantsQuery,
  useSwitchTenantMutation,
} from "../api/authApi";
import { usePostScanMutation } from "../api/scanApi";
import "./layoutStyles.css";
import { Link } from "react-router-dom";
import convertTextFormat from "../utils/convertToProperTextUtil";

const { Header } = Layout;
const { Option } = Select;

function Navbar() {
  const dispatch = useDispatch();

  // ========== AUTH / TENANT DATA ==========
  const { user, currentTenant, allTenants } = useSelector((state) => state.auth);
  const roles = currentTenant ? [currentTenant.roleName] : [];

  // ========== SCAN STATES ==========
  const [selectedScanTypes, setSelectedScanTypes] = useState([]);
  const [postScan, { isLoading: isScanLoading }] = usePostScanMutation();

  const handleScan = async () => {
    try {
      const isScanAllTrue = selectedScanTypes.includes("ALL");
      if (!isScanAllTrue) {
        await postScan({ toolsToScan: selectedScanTypes, scanAll: isScanAllTrue }).unwrap();
      } else {
        await postScan({ scanAll: isScanAllTrue }).unwrap();
      }
      message.success("Scan triggered successfully.");
    } catch (error) {
      message.error(`Failed to trigger scan: ${error?.data?.message || error}`);
      console.log(error);
    }
  };

  // ========== Switch Tenant ==========
  const { data: tenantsData, isSuccess: isTenantsSuccess } = useGetUserTenantsQuery();
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [doSwitchTenant, switchTenantState] = useSwitchTenantMutation();

  const handleTenantSwitch = async (tenantId) => {
    try {
      const result = await doSwitchTenant(tenantId).unwrap();
      const newToken = result.data.token;
      dispatch(setCredentials({ token: newToken }));
      // Invalidate relevant caches if needed
      // dispatch(findingsApi.util.invalidateTags(["Finding"]));
      // dispatch(authApi.util.invalidateTags(["Auth"]));
      // Force reload
      window.location.reload();
      message.success(`Switched to tenant ${tenantId} successfully!`);
    } catch (err) {
      console.error("Tenant switch error:", err);
      message.error("Failed to switch tenant");
    }
  };

  useEffect(() => {
    if (isTenantsSuccess && tenantsData) {
      if (currentTenant?.tenantId) {
        setSelectedTenant(currentTenant.tenantId);
      } else if (tenantsData.data.length > 0) {
        setSelectedTenant(tenantsData.data[0].tenantId);
      }
    }
  }, [isTenantsSuccess, tenantsData, currentTenant]);

  // ========== LOGOUT ==========
  const handleLogout = () => {
    dispatch(clearCredentials());
    window.location.href = "/login";
  };

  // ========== Roles for scanning ==========
  const canScan = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");

  // ========== MOBILE MENU DRAWER ==========
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  // ========== Profile Dropdown ==========

  const menuItems = (
    <Menu style={{ minWidth: 140 }}>
      <Menu.Item key="role" disabled>
        {currentTenant && convertTextFormat(currentTenant?.roleName) || "No Role"}
      </Menu.Item>
      <Menu.Item key="profile">
        <Link to="/profile">
          <UserOutlined style={{ marginRight: 8 }} />
          Profile
        </Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout} danger>
        <LogoutOutlined style={{ marginRight: 8 }} />
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="navbar-header">
      {/* Left side: brand & mobile toggle */}
      <div className="navbar-left">
        <Button
          className="mobile-menu-btn"
          type="text"
          icon={!mobileMenuOpen ? <MenuOutlined /> : <CloseOutlined />}
          onClick={toggleMobileMenu}
        />
        <div className="navbar-title">ArmorCode</div>
      </div>

      {/* Right side: Desktop actions */}
      <div className="navbar-actions desktop-actions">
        {/* If you want the search bar visible, uncomment below
        <Input
          prefix={<SearchOutlined style={{ color: "#999" }} />}
          placeholder="Search..."
          className="navbar-search"
        />
        */}

        {canScan && (
          <>
            <Select
              mode="multiple"
              placeholder="Select scan type(s)"
              style={{ width: 200 }}
              value={selectedScanTypes}
              onChange={setSelectedScanTypes}
              maxTagCount="responsive"
              allowClear
            >
              <Option value="ALL">All</Option>
              <Option value="CODE_SCAN">Code Scan</Option>
              <Option value="DEPENDABOT">Dependabot</Option>
              <Option value="SECRET_SCAN">Secret Scan</Option>
            </Select>

            <Button type="primary" onClick={handleScan} loading={isScanLoading}>
              Scan
            </Button>
          </>
        )}

        {/* Tenant Switch */}
        <p style={{ marginLeft: 5, marginRight: -10, fontSize: 14.5, fontWeight: 450 }}>
          Tenant:
        </p>
        <Select
          value={selectedTenant}
          style={{ width: 180 }}
          onChange={(val) => {
            setSelectedTenant(val);
            handleTenantSwitch(val);
          }}
          loading={switchTenantState.isLoading}
        >
          {allTenants.map((t) => {
            const isDefault = user && user.defaultTenantId === t.tenantId;
            const label = isDefault ? `${t.tenantName} (default)` : t.tenantName;
            return (
              <Select.Option key={t.tenantId} value={t.tenantId}>
                {label}
              </Select.Option>
            );
          })}
        </Select>

        {/* Profile Avatar & Dropdown */}
        <Dropdown overlay={menuItems} trigger={["click"]}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              padding: "0 8px",
            }}
          >
            <Avatar
              src={user?.imageUrl}
              style={{ marginRight: 8 }}
              icon={!user?.imageUrl && <UserOutlined />}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <p style={{ margin: 0, fontSize: 14.5, fontWeight: 450 }}>
                {user?.name || "User"}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "gray" }}>
                {currentTenant && convertTextFormat(currentTenant?.roleName) || "No Role"}
              </p>
            </div>
            <DownOutlined style={{ marginLeft: 8, fontSize: 13 }} />
          </div>
        </Dropdown>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={toggleMobileMenu}
        open={mobileMenuOpen}
        className="mobile-drawer"
      >
        {/* Replicate any needed menu items here for mobile */}
      </Drawer>
    </Header>
  );
}

export default Navbar;
