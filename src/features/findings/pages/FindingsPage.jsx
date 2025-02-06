import { useState, useEffect } from "react";
import { Typography, Spin, Alert, Drawer, Select, Button, message } from "antd";
import FindingsFilter from "../components/FindingsFilter";
import FindingsTable from "../components/FindingsTable";
import {
  useGetFindingsQuery,
  useGetFindingByIdQuery,
  // IMPORT the update mutation:
  useUpdateStateMutation,
} from "../../../api/findingsApi";
import "../components/findingsComponents.css";
import ReactMarkdown from "react-markdown";
import convertTextFormat from "../../../utils/convertToProperTextUtil";

const { Title } = Typography;

// Helper to decide next states:
function getPossibleNextStates(currentState) {
  const openStates = ["OPEN"];
  const closedStates = ["FALSE_POSITIVE", "SUPPRESSED", "FIXED"];

  if (!currentState) {
    return [...openStates, ...closedStates];
  }
  if (openStates.includes(currentState.toUpperCase())) {
    return closedStates;
  } else {
    return openStates;
  }
}

function FindingsPage() {
  // Filter states
  const [severity, setSeverity] = useState([]);
  const [state, setState] = useState([]);
  const [toolType, setToolType] = useState([]);

  // Local pagination state (1-based for user display)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Track the currently selected finding (for the drawer)
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  // Control whether the drawer is open
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Query the backend for the list of findings
  const { data, isLoading, isError, error, refetch: refetchFindings } = useGetFindingsQuery({
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
    refetch: refetchSingleFinding,
  } = useGetFindingByIdQuery(selectedFindingId, {
    skip: !selectedFindingId, // only fetch if we have an ID
  });

  // =============================
  //  STATE UPDATE MUTATION
  // =============================
  const [updateStateMutation, { isLoading: isUpdatingState }] =
    useUpdateStateMutation();

  // Keep a local state for the next state selection in the drawer
  const [nextState, setNextState] = useState("");

  // Extract the single finding from the response
  const singleFinding = singleFindingData?.data;

  // Whenever the singleFinding changes, reset the local "nextState" to the current
  useEffect(() => {
    if (singleFinding) {
      setNextState(singleFinding.state); // e.g. "OPEN" or "FIXED"
    }
  }, [singleFinding]);

  // Handle changes to the filter bar
  const handleFilterChange = (newSeverity, newState, newToolType) => {
    setSeverity(newSeverity);
    setState(newState);
    setToolType(newToolType);
    setCurrentPage(1); // reset page
  };

  // Table pagination changes
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

  // =============================
  //  HANDLE SAVING THE NEW STATE
  // =============================
  const handleSaveState = async () => {
    if (!singleFinding) return;

    try {
      // Example: We need "tool", "alertNumber", and "findingState" in the body
      // Adjust based on your real data. If your finding has an "alertNumber" property, use that.
      // Otherwise, you may adapt as needed.
      await updateStateMutation({
        tool: singleFinding.toolType, // e.g. "SECRET_SCAN"
        alertNumber: singleFinding.toolAdditionalProperties.number, // or singleFinding.alertNumber, if it exists
        findingState: nextState,
        id: singleFinding.id // e.g. "FALSE_POSITIVE"
      }).unwrap();
      setTimeout(() => {
        // Force the single-finding query to refetch
        refetchSingleFinding();
  
        // Also refetch the entire list if you want
        refetchFindings();
      }, 1600);
      message.success("Finding state updated successfully!");

      // Optionally refresh the table or do more logic here
      // e.g., close the drawer automatically if you want
      // setDrawerVisible(false);
    } catch (err) {
      // Display error message from server or fallback
      const errMsg =
        err?.data?.message || err?.message || "Error updating finding state.";
      message.error(errMsg);
    }
  };

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

      {/* {isError && (
        <Alert
          message="Error"
          description={error?.data?.message || "Could not fetch findings."}
          type="error"
          showIcon
          className="findings-error-alert"
        />
      )} */}

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
            {/* =============================== */}
            {/*   DROPDOWN SELECT + SAVE BUTTON */}
            {/* =============================== */}
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Update State
            </Typography.Title>

            {/* The possible states based on current state */}
            <Select
              style={{ width: "50%" }}
              value={convertTextFormat(nextState)}
              onChange={setNextState}
            >
              {getPossibleNextStates(singleFinding.state).map((st) => (
                <Select.Option key={st} value={st}>
                  {convertTextFormat(st)}
                </Select.Option>
              ))}
            </Select>

            <Button
              type="primary"
              onClick={handleSaveState}
              loading={isUpdatingState}
              style={{ marginTop: 5, marginLeft: 10 }}
            >
              Save
            </Button>
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
                    // Attempt to remove leading zeros
                    const finalCweNumber = cweNumber.replace(/^0+/, "");
                    return (
                      <a
                        key={`${cwe}-${idx}`}
                        href={`https://cwe.mitre.org/data/definitions/${finalCweNumber}.html`}
                        target="_blank"
                        rel="noreferrer"
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

            <Typography.Title level={5} style={{ marginTop: 16 }}>
              Description
            </Typography.Title>
            <div className="markdown-content">
              <ReactMarkdown>{singleFinding.desc || ""}</ReactMarkdown>
            </div>

            {/* Suggestions (if any) */}
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
