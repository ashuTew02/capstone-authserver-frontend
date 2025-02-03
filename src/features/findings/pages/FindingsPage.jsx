// src/features/findings/pages/FindingsPage.jsx

import { useState } from "react";
import { Typography, Spin, Alert, Drawer } from "antd";
import FindingsFilter from "../components/FindingsFilter";
import FindingsTable from "../components/FindingsTable";
import {
  useGetFindingsQuery,
  useGetFindingByIdQuery,
} from "../../../api/findingsApi";
import "../components/findingsComponents.css";
import ReactMarkdown from "react-markdown";
import convertTextFormat from "../../../utils/convertToProperTextUtil";

const { Title } = Typography;

function FindingsPage() {
  // Filter states
  const [severity, setSeverity] = useState();
  const [state, setState] = useState();
  const [toolType, setToolType] = useState();

  // Local pagination state (1-based for user display)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Track the currently selected finding (for the drawer)
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  // Control whether the drawer is open
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Query the backend for the list of findings
  const { data, isLoading, isError, error } = useGetFindingsQuery({
    severity,
    state,
    toolType,
    page: currentPage - 1, // server is 0-based
    size: pageSize,
  });

  // Query the backend for a single finding when we have a selected ID
  const {
    data: singleFindingData,
    isLoading: isSingleFindingLoading,
    isError: isSingleFindingError,
    error: singleFindingError,
  } = useGetFindingByIdQuery(selectedFindingId, {
    skip: !selectedFindingId, // only fetch if we have an ID
  });

  const handleFilterChange = (newSeverity, newState, newToolType) => {
    setSeverity(newSeverity);
    setState(newState);
    setToolType(newToolType);
    setCurrentPage(1); // reset page
  };

  const handleTableChange = (newPage, newPageSize) => {
    setCurrentPage(newPage);
    setPageSize(newPageSize);
  };

  // Called when a row is clicked in the table
  const onRowClick = (record) => {
    // record.id is the finding ID
    setSelectedFindingId(record.id);
    setDrawerVisible(true);
  };

  // close the drawer
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedFindingId(null);
  };

  // Extract the single finding from the response
  const singleFinding = singleFindingData?.data;

  return (
    <div className="findings-page">
      <Title level={2} className="findings-page-title">
        Findings
      </Title>

      {/* Filter Bar */}
      <FindingsFilter onFilterChange={handleFilterChange} />

      {isLoading && (
        <div className="findings-loading">
          <Spin size="large" tip="Loading Findings..." />
        </div>
      )}

      {isError && (
        <Alert
          message="Error"
          description={error?.data?.message || "Could not fetch findings."}
          type="error"
          showIcon
          className="findings-error-alert"
        />
      )}

      {/* Table: Only render if data is available */}
      {data && data.data && (
        <FindingsTable
          dataSource={data.data.findings || []}
          currentPage={currentPage}
          pageSize={data.data.size || pageSize}
          totalPages={data.data.totalPages}
          totalHits={data.data.totalHits}
          onChange={handleTableChange}
          onRowClick={onRowClick}
        />
      )}

      {/* Slide-in Drawer for Single Finding Details */}
      <Drawer
        title="Finding Details"
        placement="right"
        width={600}
        onClose={handleCloseDrawer}
        open={drawerVisible}
        destroyOnClose
      >
        {isSingleFindingLoading && <Spin size="large" tip="Loading..." />}

        {isSingleFindingError && (
          <Alert
            message="Error"
            description={
              singleFindingError?.data?.message ||
              "Could not fetch finding details."
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* If we have the singleFinding loaded, display its data */}
        {singleFinding && (
          <div>
            <Typography.Title level={4}>{singleFinding.title}</Typography.Title>
            <Typography.Paragraph type="secondary">
              {singleFinding.id}
            </Typography.Paragraph>

            <Typography.Paragraph>
              <strong>Tool:</strong> {convertTextFormat(singleFinding.toolType)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Severity:</strong> {singleFinding.severity}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>State:</strong> {convertTextFormat(singleFinding.state)}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>CVSS:</strong> {singleFinding.cvss || "N/A"}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>CVE:</strong> {singleFinding.cve || "N/A"}
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>File Path:</strong> {singleFinding.filePath || "N/A"}
            </Typography.Paragraph>
            {/* A list of CWEs with links */}
            <Typography.Paragraph>
              <strong>CWEs:</strong>{" "}
              {(!singleFinding.cwes || singleFinding.cwes.length === 0) &&
                "N/A"}
              {singleFinding.cwes &&
                singleFinding.cwes.map((cwe, idx) => {
                  // Check if the CWE has the format CWE-<number>
                  const match = cwe.match(/^CWE-(\d+)$/);
                  if (match) {
                    const cweNumber = match[1];
                    const isLastIndex = idx === singleFinding.cwes.length - 1;
                    return (
                      <a
                        key={`${cwe}-${idx}`}
                        href={`https://cwe.mitre.org/data/definitions/${cweNumber}.html`}
                        target="_blank"
                        rel="noreferrer"
                        // style={{ marginRight: 8 }}
                      >
                        {cwe}
                        {!isLastIndex && `, `}
                      </a>
                    );
                  }
                  // Not in standard format
                  return (
                    <span key={`${cwe}-${idx}`} style={{ marginRight: 8 }}>
                      {cwe}
                    </span>
                  );
                })}
            </Typography.Paragraph>

            {/* If the "desc" field might contain MD, you can do: */}
            <Typography.Title level={5} style={{ marginTop: 16 }}>
              Description
            </Typography.Title>
            <div className="markdown-content">
              <ReactMarkdown>{singleFinding.desc || ""}</ReactMarkdown>
            </div>

            {/* If "suggestions" is also Markdown, display it similarly */}
            {singleFinding.suggestions && (
              <>
                <Typography.Title level={5} style={{ marginTop: 16 }}>
                  Suggestions
                </Typography.Title>
                <div className="markdown-content">
                  <ReactMarkdown>{singleFinding.suggestions}</ReactMarkdown>
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default FindingsPage;
