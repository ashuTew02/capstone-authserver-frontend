import React from "react";
import { Modal, Input, Typography, Space } from "antd";

const { Text } = Typography;

function CreateTicketModal({
  visible,
  onCancel,
  onOk,
  confirmLoading,
  findingId,
  setFindingId,
  summary,
  setSummary,
  description,
  setDescription,
  attachedFindingData,
  isAttachedFindingLoading,
}) {
  return (
    <Modal
      title="Create a New Ticket"
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okButtonProps={{ loading: confirmLoading }}
      className="create-ticket-modal"
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <div className="form-field">
          <Text strong>Finding ID:</Text>
          <Input
            placeholder="Enter a valid Finding ID"
            value={findingId}
            onChange={(e) => setFindingId(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-field">
          <Text strong>Summary:</Text>
          <Input
            placeholder="Short summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-field">
          <Text strong>Description:</Text>
          <Input.TextArea
            rows={4}
            placeholder="Detailed description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
        </div>

        {/* If we have a partial finding, show minimal info */}
        {findingId &&
          !isAttachedFindingLoading &&
          attachedFindingData?.data?.id === findingId && (
            <div className="linked-finding-info">
              <Text strong>Linked Finding:</Text>
              <p>
                <strong>Title:</strong> {attachedFindingData.data.title}
              </p>
              <p>
                <strong>Severity:</strong> {attachedFindingData.data.severity}
              </p>
            </div>
          )}
      </Space>
    </Modal>
  );
}

export default CreateTicketModal;
