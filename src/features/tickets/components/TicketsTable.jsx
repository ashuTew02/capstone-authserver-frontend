import React, { useState } from "react";
import { Table, Tag, Button } from "antd";
import { CompassOutlined, LinkOutlined } from "@ant-design/icons";

/**
 * tickets: array of ticket objects
 * onRowClick: (ticket) => void, e.g. open drawer
 */
function TicketsTable({ tickets, onRowClick }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column Definitions
  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
      key: "ticketId",
      width: 120,
      render: (ticketId) => <strong>{ticketId}</strong>,
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      width: 240,
      render: (text) => <span>{text || "No summary"}</span>,
    },
    {
      title: "Status",
      dataIndex: "statusName",
      key: "statusName",
      width: 120,
      render: (status) => {
        let color = "blue";
        if (status?.toLowerCase() === "in progress") color = "orange";
        else if (status?.toLowerCase() === "done") color = "green";
        return <Tag color={color}>{status || "Unknown"}</Tag>;
      },
    },
    {
      title: "View Finding",
      dataIndex: "esFindingId",
      key: "viewFinding",
      width: 130,
      render: (findingId, record) => {
        if (!findingId) {
          return <span style={{ color: "#999" }}>No Finding</span>;
        }
        return (
          <Button
            icon={<CompassOutlined />}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/findings?findingId=${findingId}`;
            }}
          >
            Finding
          </Button>
        );
      },
    },
    {
      title: "Go to JIRA",
      dataIndex: "jiraUrl",
      key: "jiraUrl",
      width: 130,
      render: (url, record) => {
        if (!url) {
          return <span style={{ color: "#999" }}>N/A</span>;
        }
        return (
          <Button
            icon={<LinkOutlined />}
            size="small"
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              window.open(url, "_blank");
            }}
          >
            Open
          </Button>
        );
      },
    },
  ];

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div className="tickets-table-container">
      <Table
        rowKey={(record) => record.ticketId}
        columns={columns}
        dataSource={tickets}
        pagination={{
          current: currentPage,
          pageSize,
          total: tickets.length,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total) => `Total ${total} tickets`,
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => onRowClick && onRowClick(record),
          style: { cursor: "pointer" },
        })}
        className="tickets-table"
      />
    </div>
  );
}

export default TicketsTable;
