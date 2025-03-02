import React from "react";
import { Descriptions, Tag } from "antd";

/**
 * Renders a key-value table for Ticket fields:
 *  - Ticket ID
 *  - Issue Type
 *  - Issue Description
 *  - Summary
 *  - Status
 */
function TicketDetailsKeyValueTable({ ticketData }) {
  if (!ticketData) return null;

  // color logic for status
  let statusColor = "blue";
  if (ticketData.statusName?.toLowerCase() === "in progress") statusColor = "orange";
  else if (ticketData.statusName?.toLowerCase() === "done") statusColor = "green";

  return (
    <Descriptions
      bordered
      size="small"
      column={1}
      labelStyle={{
        width: "35%",
        fontWeight: 600,
      }}
      contentStyle={{
        width: "65%",
      }}
    >
      <Descriptions.Item label="Ticket ID">
        <strong>{ticketData.ticketId}</strong>
      </Descriptions.Item>
      <Descriptions.Item label="Issue Type">
        {ticketData.issueTypeName}
      </Descriptions.Item>
      <Descriptions.Item label="Issue Description">
        {ticketData.issueTypeDescription || "N/A"}
      </Descriptions.Item>
      <Descriptions.Item label="Summary">
        {ticketData.summary || "N/A"}
      </Descriptions.Item>
      <Descriptions.Item label="Status">
        <Tag color={statusColor}>{ticketData.statusName || "Unknown"}</Tag>
      </Descriptions.Item>
    </Descriptions>
  );
}

export default TicketDetailsKeyValueTable;
