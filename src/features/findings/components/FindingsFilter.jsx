import { useState, useEffect } from "react";
import { Form, Select, Button } from "antd";
import {
  useGetSeveritiesQuery,
  useGetStatesQuery,
  useGetToolTypesQuery,
} from "../../../api/findingsApi";
import convertTextFormat from "../../../utils/convertToProperTextUtil";

function FindingsFilter({
  onFilterChange,
  defaultSeverity = [],
  defaultState = [],
  defaultTool = [],
}) {
  const { data: severitiesData } = useGetSeveritiesQuery();
  const { data: statesData } = useGetStatesQuery();
  const { data: toolsData } = useGetToolTypesQuery();

  const [selectedSeverity, setSelectedSeverity] = useState(defaultSeverity);
  const [selectedState, setSelectedState] = useState(defaultState);
  const [selectedTool, setSelectedTool] = useState(defaultTool);

  useEffect(() => {
    setSelectedSeverity(defaultSeverity);
  }, [defaultSeverity]);

  useEffect(() => {
    setSelectedState(defaultState);
  }, [defaultState]);

  useEffect(() => {
    setSelectedTool(defaultTool);
  }, [defaultTool]);

  const handleApplyFilters = () => {
    onFilterChange(selectedSeverity, selectedState, selectedTool);
  };

  return (
    <div className="findings-filter-wrapper">
      <Form layout="inline" className="findings-filter-form">
        <Form.Item label="Tool Type">
          <Select
            mode="multiple"
            allowClear
            placeholder="🔎 Select tool(s)"
            style={{ width: 220 }}
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
            mode="multiple"
            allowClear
            placeholder="🚨 Select severity(ies)"
            style={{ width: 220 }}
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
            mode="multiple"
            allowClear
            placeholder="🔧 Select state(s)"
            style={{ width: 220 }}
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
          <Button
            type="primary"
            onClick={handleApplyFilters}
            style={{ borderRadius: 6 }}
          >
            Apply
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default FindingsFilter;
