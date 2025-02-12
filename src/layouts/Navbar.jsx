// src/layouts/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Layout, Input, Select, Button, message, Drawer } from "antd";
import { SearchOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { clearCredentials, setCredentials } from "../features/auth/authSlice";
import { initializeAuthData } from "../features/auth/authThunks";
import { usePostScanMutation } from "../api/scanApi";
import {
  authApi,
  useGetUserTenantsQuery,
  useSwitchTenantMutation
} from "../api/authApi";
import "./layoutStyles.css";
import { findingsApi } from "../api/findingsApi";

const { Header } = Layout;
const { Option } = Select;

function Navbar() {
  const dispatch = useDispatch();

  // ========== SCAN STATES ==========
  const [selectedScanTypes, setSelectedScanTypes] = useState([]);
  const [postScan, { isLoading: isScanLoading }] = usePostScanMutation();

  const handleScan = async () => {
    try {
      const finalScanTypes = selectedScanTypes.includes("ALL")
        ? ["ALL"]
        : selectedScanTypes;
      await postScan({
        scanTypes: finalScanTypes.length ? finalScanTypes : ["ALL"]
      }).unwrap();

      message.success("Scan triggered successfully.");
    } catch (error) {
      message.error(`Failed to trigger scan: ${error?.data?.message || error}`);
      console.log(error);
    }
  };

  // ========== AUTH / TENANT DATA ==========
  const { user, currentTenant, allTenants } = useSelector((state) => state.auth);
  const roles = currentTenant ? [currentTenant.roleName] : [];

  // fetch user tenants
  const { data: tenantsData, isSuccess: isTenantsSuccess } = useGetUserTenantsQuery();

  // local state for "which tenant is selected in the dropdown"
  const [selectedTenant, setSelectedTenant] = useState(null);

  useEffect(() => {
    if (isTenantsSuccess && tenantsData) {
      // pick the current tenant ID as the initial selected
      if (currentTenant?.tenantId) {
        setSelectedTenant(currentTenant.tenantId);
      } else {
        // fallback
        const firstTenant = tenantsData.data[0];
        if (firstTenant) setSelectedTenant(firstTenant.tenantId);
      }
    }
  }, [isTenantsSuccess, tenantsData, currentTenant]);

  // ========== SWITCH TENANT ==========

  // Using a MUTATION for switching tenant
  const [doSwitchTenant, switchTenantState] = useSwitchTenantMutation();
  // switchTenantState has isLoading, isSuccess, data, error, etc.

  const handleTenantSwitch = async (tenantId) => {
    try {
      // 1) Call the backend to switch tenant, get new token
      const result = await doSwitchTenant(tenantId).unwrap();
      // result should be something like: 
      // { success:true, data: { token: "..." }, ... }

      const newToken = result.data.token;
      // 2) Update Redux state with new token
      dispatch(setCredentials({ token: newToken }));
      dispatch(findingsApi.util.invalidateTags(['Finding']));
      dispatch(authApi.util.invalidateTags(['Auth']));

      // dispatch(initializeAuthData());

      // 3) Re-initialize user data so we fetch the new user / currentTenant


      // 4) Show success message
      window.location.reload();
      message.success(`Switched to tenant ${tenantId} successfully!`);
    } catch (err) {
      console.error("Tenant switch error:", err);
      message.error("Failed to switch tenant");
    }
  };

  // ========== LOGOUT ==========
  const handleLogout = () => {
    dispatch(clearCredentials());
    window.location.href = "/login";
  };

  // ========== ROLES ========== 
  const canScan = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");

  // ========== MOBILE MENU DRAWER ==========
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  return (
    <Header className="navbar-header">
      <div className="navbar-left">
        <Button
          className="mobile-menu-btn"
          type="text"
          icon={!mobileMenuOpen ? <MenuOutlined /> : <CloseOutlined />}
          onClick={toggleMobileMenu}
        />
        <div className="navbar-title">ArmorCode</div>
      </div>

      <div className="navbar-actions desktop-actions">
        <Input
          prefix={<SearchOutlined style={{ color: "#999" }} />}
          placeholder="Search..."
          className="navbar-search"
        />

        {/* Scan if permitted */}
        {canScan && (
          <>
            <Select
              mode="multiple"
              placeholder="Select scan type(s)"
              style={{ width: 220 }}
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

            <Button
              type="primary"
              onClick={handleScan}
              loading={isScanLoading}
              style={{ marginLeft: 8 }}
            >
              Scan
            </Button>
          </>
        )}

        {/* TENANT DROPDOWN */}
        <Select
          value={selectedTenant}
          style={{ width: 220, marginLeft: 24 }}
          onChange={(val) => {
            setSelectedTenant(val);
            handleTenantSwitch(val);
          }}
          loading={switchTenantState.isLoading}
        >
          {allTenants.map((t) => {
            const isDefault = user && user.defaultTenantId === t.tenantId;
            const label = isDefault
              ? `${t.tenantName} (default)`
              : t.tenantName;
            return (
              <Select.Option key={t.tenantId} value={t.tenantId}>
                {label}
              </Select.Option>
            );
          })}
        </Select>

        <Button type="default" onClick={handleLogout} style={{ marginLeft: 24 }}>
          Logout
        </Button>
      </div>

      {/* MOBILE DRAWER */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={toggleMobileMenu}
        open={mobileMenuOpen}
        className="mobile-drawer"
      >
        {/* Similar items as above but for mobile */}
        {/* ... */}
      </Drawer>
    </Header>
  );
}

export default Navbar;
