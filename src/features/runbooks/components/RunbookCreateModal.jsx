import React from "react";
import { Modal, Form, Input } from "antd";

function RunbookCreateModal({ open, onCancel, onCreate }) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onCreate(values);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Create Runbook"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Create"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Runbook Name"
          name="name"
          rules={[{ required: true, message: "Please enter a runbook name." }]}
        >
          <Input placeholder="E.g. My Security Runbook" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Short description" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default RunbookCreateModal;
