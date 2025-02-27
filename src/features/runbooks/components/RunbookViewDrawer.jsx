import React from "react";
import { Drawer, Steps, Spin, Typography } from "antd";
import {
  useGetRunbookTriggersQuery,
  useGetRunbookFiltersQuery,
  useGetRunbookActionsQuery,
  useGetRunbookStatusQuery,
} from "../../../api/runbooksApi";
import convertTextFormat from "../../../utils/convertToProperTextUtil";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Step } = Steps;

function RunbookViewDrawer({ runbook, onClose }) {
  // Fetch triggers, filters, actions
  const {
    data: triggersData,
    isLoading: triggersLoading,
  } = useGetRunbookTriggersQuery(runbook.id);
  const {
    data: filtersData,
    isLoading: filtersLoading,
  } = useGetRunbookFiltersQuery(runbook.id);
  const {
    data: actionsData,
    isLoading: actionsLoading,
  } = useGetRunbookActionsQuery(runbook.id);
  
  // Fetch runbook status (using runbook.id)
  const { data: runbookStatusData } = useGetRunbookStatusQuery(runbook.id);
  const runbookStatus = runbookStatusData?.data || [];
  
  // Renamed flags
  const hasTrigger = runbookStatus.includes("TRIGGER");
  const hasFilter = runbookStatus.includes("FILTER");
  const hasAction = runbookStatus.includes("ACTION");

  const triggers = triggersData?.data || [];
  const filters = filtersData?.data || [];
  const actions = actionsData?.data || [];

  const loading = triggersLoading || filtersLoading || actionsLoading;

  // Helper text for each step
  const triggersText = triggers
    .map((t) => `• ${t.triggerType && convertTextFormat(t.triggerType)}`)
    .join("\n");
  const filtersText = filters
    .map(
      (f) =>
        `• State = ${f.state && convertTextFormat(f.state) || "ANY"}\n• Severity = ${f.severity && convertTextFormat(f.severity) || "ANY"}`
    )
    .join("\n\n");
  const actionsText = actions
    .map(
      (a) =>
        `• To State: ${a.toState && convertTextFormat(a.toState) || "N/A"}\n• Ticket Create: ${a.ticketCreate ? "Yes" : "No"}`
    )
    .join("\n\n");

  return (
    <Drawer
      title={`View Runbook #${runbook.id}: ${runbook.name}`}
      width={600}
      onClose={onClose}
      open
    >
      {loading ? (
        <Spin tip="Loading runbook data..." />
      ) : (
        <div>
          <Title level={4}>Runbook Flow</Title>
          <Steps direction="vertical">
            <Step
              title="Trigger(s)"
              status={hasTrigger ? "finish" : "wait"}
              icon={
                hasTrigger ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <ClockCircleOutlined style={{ color: "gray" }} />
                )
              }
              description={
                hasTrigger ? (
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {triggersText || "No triggers"}
                  </pre>
                ) : (
                  <span style={{ color: "gray" }}>No triggers configured.</span>
                )
              }
            />
            <Step
              title="Filter(s)"
              status={hasFilter ? "finish" : "wait"}
              icon={
                hasFilter ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <ClockCircleOutlined style={{ color: "gray" }} />
                )
              }
              description={
                hasFilter ? (
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {filtersText || "No filters"}
                  </pre>
                ) : (
                  <span style={{ color: "gray" }}>No filters configured.</span>
                )
              }
            />
            <Step
              title="Action(s)"
              status={hasAction ? "finish" : "wait"}
              icon={
                hasAction ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <ClockCircleOutlined style={{ color: "gray" }} />
                )
              }
              description={
                hasAction ? (
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                    {actionsText || "No actions"}
                  </pre>
                ) : (
                  <span style={{ color: "gray" }}>No actions configured.</span>
                )
              }
            />
          </Steps>
        </div>
      )}
    </Drawer>
  );
}

export default RunbookViewDrawer;
