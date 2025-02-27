import React, { useState } from "react";
import { Table, Button, Switch, Modal, message, Space } from "antd";
import { EyeOutlined, SettingOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useGetTenantRunbooksQuery,
  useCreateRunbookMutation,
  useUpdateRunbookEnabledMutation,
  useDeleteRunbookMutation,
  useGetRunbookStatusQuery,
} from "../../../api/runbooksApi";
import RunbookCreateModal from "../components/RunbookCreateModal";
import RunbookConfigureDrawer from "../components/RunbookConfigureDrawer";
import RunbookViewDrawer from "../components/RunbookViewDrawer";
import "./runbooksPageStyles.css";

function RunbooksPage() {
  const { data, isLoading, isError, error } = useGetTenantRunbooksQuery();
  const [createRunbook] = useCreateRunbookMutation();
  const [updateRunbookEnabled] = useUpdateRunbookEnabledMutation();
  const [deleteRunbook] = useDeleteRunbookMutation();
  const {data: runbookStatusData} = useGetRunbookStatusQuery(2);
  console.log(runbookStatusData);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [configureDrawerData, setConfigureDrawerData] = useState(null);
  const [viewDrawerData, setViewDrawerData] = useState(null);

  const runbooks = data?.data || [];

  const columns = [
    {
      title: "Runbook ID",
      dataIndex: "id",
      key: "id",
      width: 90,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 220,
    },
    {
      title: "Enabled",
      dataIndex: "enabled",
      key: "enabled",
      width: 100,
      render: (val, record) => (
        <Switch
          checked={val}
          onChange={(checked) => {
            Modal.confirm({
              title: `Set runbook '${record.name}' to ${checked ? "enabled" : "disabled"}?`,
              onOk: async () => {
                try {
                  await updateRunbookEnabled({ id: record.id, enabled: checked }).unwrap();
                  message.success(
                    `Runbook '${record.name}' is now ${checked ? "enabled" : "disabled"}`
                  );
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
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => setViewDrawerData(record)}>
            View
          </Button>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => setConfigureDrawerData(record)}
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
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

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

  return (
    <div className="runbooks-page">
      <div className="runbooks-header">
        <h2 className="page-title">Runbooks</h2>
        <Button type="primary" onClick={() => setCreateModalOpen(true)}>
          Create Runbook
        </Button>
      </div>

      {isLoading && <p>Loading runbooks...</p>}
      {isError && (
        <p style={{ color: "red" }}>
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
