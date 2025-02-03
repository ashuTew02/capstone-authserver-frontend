import { useState } from "react";
import { Layout, Input, Select, Button, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { usePostScanMutation } from "../api/scanApi";
import "./layoutStyles.css";

const { Header } = Layout;
const { Option } = Select;

function Navbar() {
  // State for which scan types are selected
  const [selectedScanTypes, setSelectedScanTypes] = useState([]);

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

  const scanOptions = [
    { value: "ALL", label: "All" },
    { value: "CODE_SCAN", label: "Code Scan" },
    { value: "DEPENDABOT", label: "Dependabot" },
    { value: "SECRET_SCAN", label: "Secret Scan" },
  ];

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

        {/* Multi-select for scan type(s) */}
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

        {/* "Scan" button */}
        <Button type="primary" onClick={handleScan} loading={isScanLoading}>
          Scan
        </Button>
      </div>
    </Header>
  );
}

export default Navbar;
