import { Table, Tag } from "antd";
import "./findingsComponents.css";
import convertTextFormat from "../../../utils/convertToProperTextUtil";
import truncateText from "../../../utils/truncateTextUtil";

// Helper for severity sorting
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
  const handleTableChange = (pagination, filters, sorter) => {
    onChange(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id.localeCompare(b.id),
      sortDirections: ["ascend", "descend"],
      render: (id, record) => {
        const truncatedId = truncateText(id, 12);
        return (
          <a
            onClick={(e) => e.stopPropagation()}
            href={record.toolAdditionalProperties?.html_url}
            target="_blank"
            rel="noreferrer"
            className="table-title"
          >
            {truncatedId}
          </a>
        );
      },
      width: 150,
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      sortDirections: ["ascend", "descend"],
      render: (updatedAt) => {
        const formattedDateStr = updatedAt.replace("IST", "GMT+0530");
        const jsDate = new Date(formattedDateStr);
        return <span>{jsDate.toLocaleString("en-IN")}</span>;
      },
      width: 120,
    },
    {
      title: "Tool",
      dataIndex: "toolType",
      key: "toolType",
      sorter: (a, b) =>
        convertTextFormat(a.toolType).localeCompare(convertTextFormat(b.toolType)),
      sortDirections: ["ascend", "descend"],
      render: (tool) => <span className="table-title">{convertTextFormat(tool)}</span>,
      width: 120,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortDirections: ["ascend", "descend"],
      render: (text) => (
        <span className="table-title">{truncateText(text, 30)}</span>
      ),
      width: 180,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => a.state.localeCompare(b.state),
      sortDirections: ["ascend", "descend"],
      render: (st) => <Tag color="geekblue">{convertTextFormat(st)}</Tag>,
      width: 100,
    },
    {
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      sorter: (a, b) => severityToNumber(a.severity) - severityToNumber(b.severity),
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
      width: 100,
    },
    {
      title: "Description",
      dataIndex: "desc",
      key: "desc",
      sorter: (a, b) => a.desc.localeCompare(b.desc),
      sortDirections: ["ascend", "descend"],
      render: (text) => <span>{text ? truncateText(text, 120) : ""}</span>,
      width: 500,
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
            `Total ${total} items, ${totalPages} pages overall`,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onChange={handleTableChange}
        scroll={{ y: "52vh" }}
        onRow={(record) => ({
          onClick: () => onRowClick && onRowClick(record),
        })}
      />
    </div>
  );
}

export default FindingsTable;
