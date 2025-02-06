import React, { useState } from "react";
import { Typography, Card, Row, Col, Select, Spin } from "antd";
import {
  useGetToolDistributionQuery,
  useGetSeverityDistributionQuery,
  useGetStateDistributionQuery,
} from "../api/findingsApi";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";

import {
  useGetSeveritiesQuery,
  useGetStatesQuery,
  useGetToolTypesQuery,
} from "../api/findingsApi";
import convertTextFormat from "../utils/convertToProperTextUtil";

const { Title } = Typography;
const { Option } = Select;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666"];

function Dashboard() {
  const navigate = useNavigate();
  // selectedTools here are used only for filtering the bar charts
  const [selectedTools, setSelectedTools] = useState([]);

  const { data: severitiesData } = useGetSeveritiesQuery();
  const { data: statesData } = useGetStatesQuery();
  const { data: toolsData } = useGetToolTypesQuery();

  // -------------------------------
  // Chart 1: Tools Pie (Independent)
  // -------------------------------
  const {
    data: toolDistData,
    isLoading: isToolDistLoading,
    isError: isToolDistError,
  } = useGetToolDistributionQuery();

  // -------------------------------
  // Chart 2: Severity Bar (Filtered)
  // -------------------------------
  const {
    data: severityDistData,
    isLoading: isSeverityDistLoading,
  } = useGetSeverityDistributionQuery(selectedTools);

  // -------------------------------
  // Chart 3: State Bar (Filtered)
  // -------------------------------
  const {
    data: stateDistData,
    isLoading: isStateDistLoading,
  } = useGetStateDistributionQuery(selectedTools);

  // Transform distribution data into arrays for Recharts
  const pieData = toolDistData?.data
    ? Object.entries(toolDistData.data).map(([k, v]) => ({
        name: k,
        value: v,
      }))
    : [];

  const severityBarData = severityDistData?.data
    ? Object.entries(severityDistData.data).map(([k, v]) => ({
        severity: k,
        count: v,
      }))
    : [];

  const stateBarData = stateDistData?.data
    ? Object.entries(stateDistData.data).map(([k, v]) => ({
        state: k,
        count: v,
      }))
    : [];

  // Drill-down navigation functions (as before)
  const navigateToFindingsPage = ({ toolType = [], severity = [], state = [] }) => {
    const params = new URLSearchParams();
    toolType.forEach((t) => params.append("toolType", t));
    severity.forEach((s) => params.append("severity", s));
    state.forEach((st) => params.append("state", st));
    navigate(`/findings?${params.toString()}`);
  };

  // onPieClick: clicking a pie slice drills down with that tool type
  const onPieClick = (chartData) => {
    if (chartData && chartData.name) {
      navigateToFindingsPage({ toolType: [chartData.name] });
    }
  };

  // onSeverityBarClick: drills down with selected severity and current selected tools
  const onSeverityBarClick = (chartData) => {
    if (chartData && chartData.activeLabel) {
      navigateToFindingsPage({
        severity: [chartData.activeLabel],
        toolType: selectedTools,
      });
    }
  };

  // onStateBarClick: drills down with selected state and current selected tools
  const onStateBarClick = (chartData) => {
    if (chartData && chartData.activeLabel) {
      navigateToFindingsPage({
        state: [chartData.activeLabel],
        toolType: selectedTools,
      });
    }
  };

  return (
    <div className="dashboard-container">
      <Title level={2} className="dashboard-title">
        Dashboard
      </Title>

      <Card className="dashboard-card" hoverable>
        <p>
          Welcome to ArmorCode! This dashboard provides a summary of the findings in one place.
        </p>
      </Card>

      {/* Multi-select for filtering the bar charts */}
      <div style={{ margin: "16px 0" }}>
        <span style={{ marginRight: 8 }}>Select tool(s) for bar charts:</span>
        <Select
          mode="multiple"
          style={{ width: 300 }}
          placeholder="All Tools"
          value={selectedTools}
          onChange={setSelectedTools}
          allowClear
        >
          {toolsData?.data?.data.map((t) => (
            <Option key={t}>{convertTextFormat(t)}</Option>
          ))}
        </Select>
      </div>

      {/* Row 1: Tools Pie Chart (Half Width) */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Findings by Tool">
            {isToolDistLoading ? (
              <Spin />
            ) : isToolDistError ? (
              <div style={{ color: "red" }}>Error loading tool distribution.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                    onClick={onPieClick}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Row 2: Two Bar Charts side by side (each Half Width) */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Findings by Severity">
            {isSeverityDistLoading ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={severityBarData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  onClick={onSeverityBarClick}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Findings by State">
            {isStateDistLoading ? (
              <Spin />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stateBarData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                  onClick={onStateBarClick}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
