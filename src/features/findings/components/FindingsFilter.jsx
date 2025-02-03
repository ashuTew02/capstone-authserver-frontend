// src/features/findings/components/FindingsFilter.jsx
import { useState } from "react";
import { Form, Select, Button } from "antd";
import {
  useGetSeveritiesQuery,
  useGetStatesQuery,
  useGetToolTypesQuery,
} from "../../../api/findingsApi";
import convertTextFormat from "../../../utils/convertToProperTextUtil";

// eslint-disable-next-line react/prop-types
function FindingsFilter({ onFilterChange }) {
  const { data: severitiesData } = useGetSeveritiesQuery();
  const { data: statesData } = useGetStatesQuery();
  const { data: toolsData } = useGetToolTypesQuery();
  console.log(severitiesData);
  // Local states for each filter
  const [selectedSeverity, setSelectedSeverity] = useState();
  const [selectedState, setSelectedState] = useState();
  const [selectedTool, setSelectedTool] = useState();

  const handleApplyFilters = () => {
    onFilterChange(selectedSeverity, selectedState, selectedTool);
  };

  return (
    <Form layout="inline" style={{ marginBottom: 16 }}>
      <Form.Item label="Tool Type">
        <Select
          allowClear
          placeholder="Select tool"
          style={{ width: 160 }}
          value={selectedTool}
          onChange={(val) => setSelectedTool(val)}
        >
          {toolsData?.data?.data?.map((tool) => (
            <Select.Option key={tool} value={tool}>
              {convertTextFormat(tool)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Severity">
        <Select
          allowClear
          placeholder="Select severity"
          style={{ width: 160 }}
          value={selectedSeverity}
          onChange={(val) => setSelectedSeverity(val)}
        >
          {severitiesData?.data?.data?.map((sev) => (
            <Select.Option key={sev} value={sev}>
              {convertTextFormat(sev)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="State">
        <Select
          allowClear
          placeholder="Select state"
          style={{ width: 160 }}
          value={selectedState}
          onChange={(val) => setSelectedState(val)}
        >
          {statesData?.data?.data?.map((st) => (
            <Select.Option key={st} value={st}>
              {convertTextFormat(st)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={handleApplyFilters}>
          Apply
        </Button>
      </Form.Item>
    </Form>
  );
}

export default FindingsFilter;
