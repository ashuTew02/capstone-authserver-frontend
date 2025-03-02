import React, { useState } from "react";
import { Table, Button, Switch, Modal, message, Space, Tag } from "antd";
import {
  EyeOutlined,
  SettingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import {
  useGetTenantRunbooksQuery,
  useCreateRunbookMutation,
  useUpdateRunbookEnabledMutation,
  useDeleteRunbookMutation,
} from "../../../api/runbooksApi";

import RunbookCreateModal from "../components/RunbookCreateModal";
import RunbookConfigureDrawer from "../components/RunbookConfigureDrawer";
import RunbookViewDrawer from "../components/RunbookViewDrawer";

import "./runbooksPageStyles.css";

function RunbooksPage() {
  // =================== Queries & Mutations ===================
  const { data, isLoading, isError, error } = useGetTenantRunbooksQuery();
  const [createRunbook] = useCreateRunbookMutation();
  const [updateRunbookEnabled] = useUpdateRunbookEnabledMutation();
  const [deleteRunbook] = useDeleteRunbookMutation();

  // =================== Local State ===================
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [configureDrawerData, setConfigureDrawerData] = useState(null);
  const [viewDrawerData, setViewDrawerData] = useState(null);

  // =================== Data Prep ===================
  const runbooks = data?.data || [];

  // Helper: "Configured" or "Not Configured"
  function getConfigurationStatus(rb) {
    const triggers = rb.triggers ?? [];
    const filters = rb.filters ?? [];
    const actions = rb.actions ?? [];
    if (triggers.length === 0 || filters.length === 0 || actions.length === 0) {
      return <Tag color="magenta">Not Configured</Tag>;
    }
    return <Tag color="blue">Configured</Tag>;
  }

  // =================== Table Columns ===================
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => <strong>{id}</strong>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b style={{ color: "#3f316b" }}>{text}</b>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 220,
      render: (desc) =>
        desc ? (
          <span>{desc}</span>
        ) : (
          <span style={{ color: "#999" }}>No description</span>
        ),
    },
    {
      title: "Configuration",
      key: "configuration",
      width: 150,
      render: (_, record) => getConfigurationStatus(record),
    },
    // ================
    // (1) Restored the "Enabled" column
    // ================
    {
      title: "Enabled",
      dataIndex: "enabled",
      key: "enabled",
      width: 100,
      render: (val, record) => (
        <Switch
          className="runbook-enable-switch"
          checked={val}
          onClick={(e) => e.stopPropagation()} // stop row-click
          onChange={(checked) => {
            // show confirm modal
            Modal.confirm({
              title: `Set runbook '${record.name}' to ${
                checked ? "enabled" : "disabled"
              }?`,
              onOk: async () => {
                try {
                  await updateRunbookEnabled({
                    id: record.id,
                    enabled: checked,
                  }).unwrap();
                  message.success(
                    `Runbook '${record.name}' is now ${
                      checked ? "enabled" : "disabled"
                    }`
                  );
                  // The RTK Query mutation likely invalidates the "Runbook" tag,
                  // so the table re-fetches and updates automatically.
                } catch (err) {
                  message.error("Failed to update runbook status");
                }
              },
            });
          }}
        />
      ),
    },

    {
      title: "Actions",
      key: "actions",
      width: 240,
      render: (_, record) => (
        <Space
          onClick={(e) => {
            // Stop row click from firing
            e.stopPropagation();
          }}
        >
          <Button
            icon={<EyeOutlined />}
            onClick={() => setViewDrawerData(record)}
            style={{ borderRadius: 4 }}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => setConfigureDrawerData(record)}
            style={{ borderRadius: 4 }}
          >
            Configure
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: `Delete runbook '${record.name}'?`,
                content: "This action is irreversible.",
                onOk: async () => {
                  try {
                    await deleteRunbook(record.id).unwrap();
                    message.success(`Deleted runbook '${record.name}'`);
                  } catch (err) {
                    message.error("Failed to delete runbook");
                  }
                },
              });
            }}
            style={{ borderRadius: 4 }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // =================== Handlers ===================
  const handleCreateRunbook = async (values) => {
    try {
      await createRunbook(values).unwrap();
      message.success("Runbook created successfully!");
      setCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to create runbook.");
    }
  };

  // =================== Render ===================
  return (
    <div className="runbooks-page">
      <div className="runbooks-header">
        <h2 className="page-title">Runbooks</h2>
        <Button
          type="primary"
          onClick={() => setCreateModalOpen(true)}
          className="create-runbook-button"
        >
          Create Runbook
        </Button>
      </div>

      {isLoading && <p style={{ marginTop: 24 }}>Loading runbooks...</p>}
      {isError && (
        <p style={{ color: "red", marginTop: 24 }}>
          {error?.data?.message || "Failed to load runbooks."}
        </p>
      )}

      {!isLoading && !isError && (
        <Table
          rowKey="id"
          dataSource={runbooks}
          columns={columns}
          pagination={false}
          className="runbooks-table"
          // Entire row is clickable => open the View Drawer
          onRow={(record) => ({
            onClick: (e) => {
              // If we clicked on the switch, do nothing
              if (e.target.closest(".runbook-enable-switch")) {
                return;
              }
              setViewDrawerData(record);
            },
            style: { cursor: "pointer" },
          })}
          scroll={{ x: "max-content" }}
        />
      )}

      {/* Create Runbook Modal */}
      <RunbookCreateModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onCreate={handleCreateRunbook}
      />

      {/* Configure Drawer */}
      {configureDrawerData && (
        <RunbookConfigureDrawer
          runbook={configureDrawerData}
          onClose={() => setConfigureDrawerData(null)}
        />
      )}

      {/* View Drawer */}
      {viewDrawerData && (
        <RunbookViewDrawer
          runbook={viewDrawerData}
          onClose={() => setViewDrawerData(null)}
        />
      )}
    </div>
  );
}

export default RunbooksPage;
