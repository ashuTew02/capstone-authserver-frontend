import React, { useState } from "react";
import { Typography, Card, Row, Col, Select, Spin, List } from "antd";
import {
  useGetToolDistributionQuery,
  useGetSeverityDistributionQuery,
  useGetStateDistributionQuery,
  useGetFindingsQuery, // Reuse existing for counts & top 10
  useGetSeveritiesQuery,
  useGetStatesQuery,
  useGetToolTypesQuery,
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
import { useNavigate } from "react-router-dom";
import convertTextFormat from "../utils/convertToProperTextUtil";
import "./dashboard.css";

const { Title } = Typography;
const { Option } = Select;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666"];

function Dashboard() {
  const navigate = useNavigate();
  const [selectedTools, setSelectedTools] = useState([]);

  // =========================
  // Fetch counts for top cards
  // =========================

  // 1) Total Findings
  const {
    data: allFindingsData,
    isLoading: isAllFindingsLoading,
  } = useGetFindingsQuery({ page: 0, size: 1 });
  const totalFindings = allFindingsData?.data?.totalHits || 0;

  // 2) Critical Findings
  const {
    data: criticalFindingsData,
    isLoading: isCriticalFindingsLoading,
  } = useGetFindingsQuery({
    severity: ["CRITICAL"],
    page: 0,
    size: 1,
  });
  const totalCritical = criticalFindingsData?.data?.totalHits || 0;

  // 3) Secret Scan Findings
  const {
    data: secretScanData,
    isLoading: isSecretScanLoading,
  } = useGetFindingsQuery({
    toolType: ["SECRET_SCAN"],
    page: 0,
    size: 1,
  });
  const totalSecret = secretScanData?.data?.totalHits || 0;

  // =========================
  // 10 most recent critical findings
  // =========================
  const {
    data: recentCriticalData,
    isLoading: isRecentCriticalLoading,
  } = useGetFindingsQuery({
    severity: ["CRITICAL"],
    page: 0,
    size: 10, // top 10
  });
  const recentCriticalList = recentCriticalData?.data?.findings || [];

  // =========================
  // Other queries for charts
  // =========================
  const { data: severitiesData } = useGetSeveritiesQuery();
  const { data: statesData } = useGetStatesQuery();
  const { data: toolsData } = useGetToolTypesQuery();

  // Tools Pie
  const {
    data: toolDistData,
    isLoading: isToolDistLoading,
    isError: isToolDistError,
  } = useGetToolDistributionQuery();

  // Severity Bar
  const {
    data: severityDistData,
    isLoading: isSeverityDistLoading,
  } = useGetSeverityDistributionQuery(selectedTools);

  // State Bar
  const {
    data: stateDistData,
    isLoading: isStateDistLoading,
  } = useGetStateDistributionQuery(selectedTools);

  // =========================
  // Data prep for recharts
  // =========================
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

  // =========================
  // Handlers
  // =========================
  const navigateToFindingsPage = ({ toolType = [], severity = [], state = [] }) => {
    const params = new URLSearchParams();
    toolType.forEach((t) => params.append("toolType", t));
    severity.forEach((s) => params.append("severity", s));
    state.forEach((st) => params.append("state", st));
    navigate(`/findings?${params.toString()}`);
  };

  // Clicking a top card => go to findings with appropriate filter
  const handleCardClick = (type) => {
    switch (type) {
      case "ALL":
        navigate("/findings"); // no filters
        break;
      case "CRITICAL":
        navigateToFindingsPage({ severity: ["CRITICAL"] });
        break;
      case "SECRET":
        navigateToFindingsPage({ toolType: ["SECRET_SCAN"] });
        break;
      default:
        break;
    }
  };

  // Chart clicks
  const onPieClick = (chartData) => {
    if (chartData?.name) {
      navigateToFindingsPage({ toolType: [chartData.name] });
    }
  };
  const onSeverityBarClick = (chartData) => {
    if (chartData?.activeLabel) {
      navigateToFindingsPage({
        severity: [chartData.activeLabel],
        toolType: selectedTools,
      });
    }
  };
  const onStateBarClick = (chartData) => {
    if (chartData?.activeLabel) {
      navigateToFindingsPage({
        state: [chartData.activeLabel],
        toolType: selectedTools,
      });
    }
  };

  // "View All" in top 10 critical
  const handleViewAllCritical = () => {
    navigateToFindingsPage({ severity: ["CRITICAL"] });
  };

  return (
    <div className="dashboard-container">
      <Title level={2} className="dashboard-title">
        Dashboard
      </Title>
      {/* 
         WELCOME / INTRO CARD
      */}
      {/* <Card className="dashboard-card" hoverable>
        <p>
          Welcome to ArmorCode! This dashboard provides a summary of the findings in one place.
        </p>
      </Card> */}

      
      {/* ===================
         TOP SUMMARY CARDS
      ==================== */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{ 
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              minHeight: 100,
              cursor: "pointer"
            }}
            onClick={() => handleCardClick("ALL")}
          >
            <Title level={4} style={{ margin: 0 }}>
              Total Findings
            </Title>
            {isAllFindingsLoading ? (
              <Spin />
            ) : (
              <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
                {totalFindings}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{ 
              backgroundColor: "#fff1f0",
              borderRadius: "8px",
              minHeight: 100,
              cursor: "pointer",
            }}
            onClick={() => handleCardClick("CRITICAL")}
          >
            <Title level={4} style={{ margin: 0 }}>
              Critical Findings
            </Title>
            {isCriticalFindingsLoading ? (
              <Spin />
            ) : (
              <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
                {totalCritical}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            hoverable
            style={{ 
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              minHeight: 100,
              cursor: "pointer",
            }}
            onClick={() => handleCardClick("SECRET")}
          >
            <Title level={4} style={{ margin: 0 }}>
              Secret Scan Findings
            </Title>
            {isSecretScanLoading ? (
              <Spin />
            ) : (
              <div style={{ fontSize: 24, fontWeight: "bold", marginTop: 8 }}>
                {totalSecret}
              </div>
            )}
          </Card>
        </Col>
      </Row>



      {/* 
         ROW WITH: 
         LEFT => PIE CHART
         RIGHT => TOP 10 CRITICAL FINDINGS (SCROLLABLE)
      */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Findings by Tool" className="chart-card" hoverable>
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
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="10 Most Recent Critical Findings"
            className="chart-card"
            hoverable
            style={{ maxHeight: 405, overflowY: "auto" }}
            extra={
              <a onClick={handleViewAllCritical} style={{ fontWeight: "bold" }}>
                View All
              </a>
            }
          >
            {isRecentCriticalLoading ? (
              <Spin />
            ) : recentCriticalList.length === 0 ? (
              <div style={{ color: "#999" }}>No critical findings found.</div>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={recentCriticalList}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title || "No Title"}
                      description={`ID: ${item.id}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 
         SELECT TOOLS + SEVERITY/STATE BARS
      */}
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

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Findings by Severity" className="chart-card" hoverable>
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
          <Card title="Findings by State" className="chart-card" hoverable>
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
