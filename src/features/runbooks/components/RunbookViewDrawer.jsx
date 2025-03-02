import React, { useState, useEffect } from "react";
import {
  Drawer,
  Spin,
  Alert,
  Typography,
  Descriptions,
  Steps,
  Switch,
  Modal,
  message,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import {
  useGetRunbookTriggersQuery,
  useGetRunbookFiltersQuery,
  useGetRunbookActionsQuery,
  useGetRunbookStatusQuery,
  useUpdateRunbookEnabledMutation,
} from "../../../api/runbooksApi";
import convertTextFormat from "../../../utils/convertToProperTextUtil";
import "./runbookViewDrawer.css";

const { Title } = Typography;
const { Step } = Steps;

function RunbookViewDrawer({ runbook, onClose }) {
  // ============== Queries ==============
  const {
    data: triggersData,
    isLoading: triggersLoading,
    isError: triggersError,
  } = useGetRunbookTriggersQuery(runbook.id);

  const {
    data: filtersData,
    isLoading: filtersLoading,
    isError: filtersError,
  } = useGetRunbookFiltersQuery(runbook.id);

  const {
    data: actionsData,
    isLoading: actionsLoading,
    isError: actionsError,
  } = useGetRunbookActionsQuery(runbook.id);

  const { isLoading: statusLoading, isError: statusError } =
    useGetRunbookStatusQuery(runbook.id);

  // (2) Local state for toggling runbook "enabled"
  const [updateRunbookEnabled] = useUpdateRunbookEnabledMutation();
  const [localEnabled, setLocalEnabled] = useState(runbook.enabled);
  const [updatingToggle, setUpdatingToggle] = useState(false);

  // If runbook.enabled changes externally, sync local state
  useEffect(() => {
    setLocalEnabled(runbook.enabled);
  }, [runbook.enabled]);

  // ============== Data ==============
  const loading = triggersLoading || filtersLoading || actionsLoading || statusLoading;
  const hasError = triggersError || filtersError || actionsError || statusError;

  const triggers = triggersData?.data || [];
  const filters = filtersData?.data || [];
  const actions = actionsData?.data || [];

  // Step statuses:
  const triggersStepStatus = triggers.length ? "finish" : "error";
  const filtersStepStatus = filters.length ? "finish" : "error";
  const actionsStepStatus = actions.length ? "finish" : "error";

  // ============== Handlers ==============
  const handleToggleEnable = (checked) => {
    Modal.confirm({
      title: `Set runbook '${runbook.name}' to ${
        checked ? "enabled" : "disabled"
      }?`,
      onOk: async () => {
        try {
          setUpdatingToggle(true);
          await updateRunbookEnabled({ id: runbook.id, enabled: checked }).unwrap();
          setLocalEnabled(checked); // immediately reflect new state in UI
          message.success(
            `Runbook '${runbook.name}' is now ${
              checked ? "enabled" : "disabled"
            }`
          );
        } catch {
          message.error("Failed to update runbook status");
        } finally {
          setUpdatingToggle(false);
        }
      },
    });
  };

  return (
    <Drawer
      // For smooth open/close transitions
      rootClassName="runbook-view-drawer"
      title="Runbook Details"
      width={620}
      onClose={onClose}
      open
      maskClosable
      destroyOnClose={false}
      maskStyle={{ backdropFilter: "blur(4px)" }}
    >
      {loading && (
        <div className="drawer-loading">
          <Spin tip="Loading runbook data..." size="large" />
        </div>
      )}

      {hasError && !loading && (
        <Alert
          message="Error Loading Runbook Data"
          description="Some or all runbook info could not be fetched."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {!loading && !hasError && (
        <div className="drawer-content">
          {/* Runbook Title & Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              {runbook.name}
            </Title>
            
            <Switch
              loading={updatingToggle}
              checked={localEnabled}
              onChange={handleToggleEnable}
              checkedChildren="Enabled"
              unCheckedChildren="Disabled"
            />
          </div>

          {/* Key-Value Info */}
          <Descriptions
            bordered
            column={1}
            size="small"
            labelStyle={{ width: 120 }}
            layout="horizontal"
          >
            <Descriptions.Item label="Runbook ID">
              {runbook.id}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {runbook.description || "No description"}
            </Descriptions.Item>
          </Descriptions>

          <Steps
            size="small"
            current={-1} // so no step is "in progress"
            style={{ marginTop: 16 }}
          >
            <Step
              title="Triggers"
              status={triggersStepStatus}
              icon={
                triggersStepStatus === "finish" ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "red" }} />
                )
              }
            />
            <Step
              title="Filters"
              status={filtersStepStatus}
              icon={
                filtersStepStatus === "finish" ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "red" }} />
                )
              }
            />
            <Step
              title="Actions"
              status={actionsStepStatus}
              icon={
                actionsStepStatus === "finish" ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <CloseCircleOutlined style={{ color: "red" }} />
                )
              }
            />
          </Steps>

          {/* Triggers */}
          <Title level={5} style={{ marginTop: 24 }}>
            Triggers
          </Title>
          {triggers.length === 0 ? (
            <Alert
              message="No triggers configured."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Descriptions bordered column={1} size="small">
              {triggers.map((t, i) => (
                <Descriptions.Item label="Type" key={i}>
                  {convertTextFormat(t.triggerType)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}

          {/* Filters */}
          <Title level={5} style={{ marginTop: 24 }}>
            Filters
          </Title>
          {filters.length === 0 ? (
            <Alert
              message="No filters configured."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Descriptions bordered column={1} size="small">
              {filters.map((f, i) => (
                <React.Fragment key={i}>
                  <Descriptions.Item label="State">
                    {f.state ? convertTextFormat(f.state) : "ANY"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Severity">
                    {f.severity ? convertTextFormat(f.severity) : "ANY"}
                  </Descriptions.Item>
                </React.Fragment>
              ))}
            </Descriptions>
          )}

          {/* Actions */}
          <Title level={5} style={{ marginTop: 24 }}>
            Actions
          </Title>
          {actions.length === 0 ? (
            <Alert
              message="No actions configured."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Descriptions bordered column={1} size="small">
              {actions.map((a, i) => (
                <React.Fragment key={i}>
                  <Descriptions.Item label="To State">
                    {a.toState ? convertTextFormat(a.toState) : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ticket Create">
                    {a.ticketCreate ? "Yes" : "No"}
                  </Descriptions.Item>
                </React.Fragment>
              ))}
            </Descriptions>
          )}

          {/* Horizontal Steps overview */}
          {/* <Title level={5} style={{ marginTop: 32 }}>
            Overview Steps
          </Title> */}

        </div>
      )}
    </Drawer>
  );
}

export default RunbookViewDrawer;
