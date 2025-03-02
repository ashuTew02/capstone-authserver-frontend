import React from "react";
import { Table, Tag, Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import "./findingsTable.css"; // keep table-specific CSS here
import convertTextFormat from "../../../utils/convertToProperTextUtil";
import truncateText from "../../../utils/truncateTextUtil";

function severityToNumber(sev) {
  switch (sev) {
    case "CRITICAL":
      return 5;
    case "HIGH":
      return 4;
    case "MEDIUM":
      return 3;
    case "LOW":
      return 2;
    case "INFO":
      return 1;
    default:
      return 0;
  }
}

function FindingsTable({
  dataSource,
  currentPage,
  pageSize,
  totalHits,
  totalPages,
  onChange,
  onRowClick,
}) {
  const handleTableChange = (pagination) => {
    onChange(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 150,
      sorter: (a, b) => a.id.localeCompare(b.id),
      sortDirections: ["ascend", "descend"],
      render: (id, record) => {
        const truncatedId = truncateText(id, 12);
        return record?.toolAdditionalProperties?.html_url ? (
          <a
            onClick={(e) => e.stopPropagation()}
            href={record.toolAdditionalProperties.html_url}
            target="_blank"
            rel="noreferrer"
            className="table-title"
          >
            {truncatedId}
          </a>
        ) : (
          <span className="table-title" onClick={(e) => e.stopPropagation()}>
            {truncatedId}
          </span>
        );
      },
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 120,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      sortDirections: ["ascend", "descend"],
      render: (updatedAt) => {
        const formattedDateStr = updatedAt.replace("IST", "GMT+0530");
        const jsDate = new Date(formattedDateStr);
        return <span>{jsDate.toLocaleString("en-IN")}</span>;
      },
    },
    {
      title: "Tool",
      dataIndex: "toolType",
      key: "toolType",
      width: 120,
      sorter: (a, b) =>
        convertTextFormat(a.toolType).localeCompare(convertTextFormat(b.toolType)),
      sortDirections: ["ascend", "descend"],
      render: (tool) => (
        <span className="table-title">{convertTextFormat(tool)}</span>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 180,
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortDirections: ["ascend", "descend"],
      render: (text) => (
        <span className="table-title">{truncateText(text, 30)}</span>
      ),
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      width: 100,
      sorter: (a, b) => a.state.localeCompare(b.state),
      sortDirections: ["ascend", "descend"],
      render: (st) => <Tag color="geekblue">{convertTextFormat(st)}</Tag>,
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      width: 100,
      sorter: (a, b) =>
        severityToNumber(a.severity) - severityToNumber(b.severity),
      sortDirections: ["ascend", "descend"],
      render: (severity) => {
        let color = "blue";
        if (severity === "CRITICAL") color = "red";
        else if (severity === "HIGH") color = "volcano";
        else if (severity === "MEDIUM") color = "orange";
        else if (severity === "LOW") color = "green";
        else if (severity === "INFO") color = "cyan";
        return <Tag color={color}>{severity}</Tag>;
      },
    },
    {
      title: "Description",
      dataIndex: "desc",
      key: "desc",
      width: 300,
      sorter: (a, b) => a.desc.localeCompare(b.desc),
      sortDirections: ["ascend", "descend"],
      render: (text) => <span>{text ? truncateText(text, 70) : ""}</span>,
    },
    {
      title: "Ticket",
      dataIndex: "ticketId",
      key: "ticketId",
      width: 120,
      render: (ticketId) => {
        if (!ticketId) {
          return <span style={{ color: "#999" }}>No Ticket</span>;
        }
        return (
          <Button
            size="small"
            type="primary"
            icon={<LinkOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/tickets?ticketId=${ticketId}`;
            }}
          >
            {ticketId}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="findings-table-container">
      <Table
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalHits,
          showTotal: (total) =>
            `Total ${total} items (${totalPages} pages overall)`,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        scroll={{ x: "max-content", y: "52vh" }}
        onRow={(record) => ({
          onClick: () => onRowClick && onRowClick(record),
        })}
      />
    </div>
  );
}

export default FindingsTable;
