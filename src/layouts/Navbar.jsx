// src/layouts/Navbar.js

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, Input, Select, Button, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { usePostScanMutation } from "../api/scanApi";
import { clearCredentials } from "../features/auth/authSlice"; // For logout
import "./layoutStyles.css";

const { Header } = Layout;
const { Option } = Select;

function Navbar() {
  // State for which scan types are selected
  const [selectedScanTypes, setSelectedScanTypes] = useState([]);

  // Access roles from Redux
  const { roles } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // RTK Query mutation
  const [postScan, { isLoading: isScanLoading }] = usePostScanMutation();

  // POST request via RTK Query
  const handleScan = async () => {
    try {
      // If "ALL" is selected, override all other selections with ["ALL"] only
      const finalScanTypes = selectedScanTypes.includes("ALL")
        ? ["ALL"]
        : selectedScanTypes;

      await postScan({
        owner: "ashuTew01", // Hard-code for now
        repository: "juice-shop",
        scanTypes: finalScanTypes.length ? finalScanTypes : ["ALL"],
      }).unwrap();

      // If success
      message.success("Scan triggered successfully.");
    } catch (error) {
      // On any error or non-200 response
      message.error(
        `Failed to trigger scan: ${
          error?.data?.message || error?.error || error
        }`
      );
      console.log(error);
    }
  };

  // Add a logout function
  const handleLogout = () => {
    // Optionally call /auth/logout on the server
    // dispatch your mutation or fetch if needed
    // Then clear credentials locally
    dispatch(clearCredentials());
    window.location.href = "/login"; // or use navigate
  };

  const scanOptions = [
    { value: "ALL", label: "All" },
    { value: "CODE_SCAN", label: "Code Scan" },
    { value: "DEPENDABOT", label: "Dependabot" },
    { value: "SECRET_SCAN", label: "Secret Scan" },
  ];

  // Check if user is ADMIN or SUPER_ADMIN
  const canScan = roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");

  return (
    <Header className="navbar-header">
      {/* Left-side brand/title */}
      <div className="navbar-title">ArmorCode</div>

      <div className="navbar-actions">
        {/* Search bar placeholder */}
        <Input
          prefix={<SearchOutlined style={{ color: "#999" }} />}
          placeholder="Search..."
          className="navbar-search"
        />

        {/* Only show scan options if ADMIN or SUPER_ADMIN */}
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
              {scanOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
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

        {/* Logout button */}
        <Button
          type="default"
          onClick={handleLogout}
          style={{ marginLeft: 24 }}
        >
          Logout
        </Button>
      </div>
    </Header>
  );
}

export default Navbar;
