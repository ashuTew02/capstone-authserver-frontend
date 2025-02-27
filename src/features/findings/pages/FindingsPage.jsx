import { useState, useEffect } from "react";
import {
  Typography,
  Spin,
  Alert,
  Drawer,
  Button,
  message,
  Select,
} from "antd";
import { useSearchParams } from "react-router-dom";
import FindingsFilter from "../components/FindingsFilter";
import FindingsTable from "../components/FindingsTable";
import {
  useGetFindingsQuery,
  useGetFindingByIdQuery,
  useUpdateStateMutation,
} from "../../../api/findingsApi";
import "../components/findingsComponents.css";
import ReactMarkdown from "react-markdown";
import convertTextFormat from "../../../utils/convertToProperTextUtil";
import { useSelector } from "react-redux";

const { Title } = Typography;

function getPossibleNextStates(currentState) {
  const openStates = ["OPEN"];
  const closedStates = ["FALSE_POSITIVE", "SUPPRESSED", "FIXED"];
  if (!currentState) {
    return [...openStates, ...closedStates];
  }
  return openStates.includes(currentState.toUpperCase())
    ? closedStates
    : openStates;
}

function FindingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSeverity = searchParams.getAll("severity");
  const initialState = searchParams.getAll("state");
  const initialToolType = searchParams.getAll("toolType");
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSize = parseInt(searchParams.get("size") || "10", 10);
  const initialFindingId = searchParams.get("findingId");

  const [severity, setSeverity] = useState(initialSeverity);
  const [state, setState] = useState(initialState);
  const [toolType, setToolType] = useState(initialToolType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [selectedFindingId, setSelectedFindingId] = useState(initialFindingId);
  const [drawerVisible, setDrawerVisible] = useState(Boolean(initialFindingId));

  const roles = useSelector((s) => [s.auth?.currentTenant?.roleName]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refetchFindings,
  } = useGetFindingsQuery({
    severity,
    state,
    toolType,
    page: currentPage - 1,
    size: pageSize,
  });

  const {
    data: singleFindingData,
    isLoading: isSingleFindingLoading,
    isError: isSingleFindingError,
    error: singleFindingError,
    refetch: refetchSingleFinding,
  } = useGetFindingByIdQuery(selectedFindingId, {
    skip: !selectedFindingId,
  });

  const singleFinding = singleFindingData?.data;

  const [updateStateMutation, { isLoading: isUpdatingState }] =
    useUpdateStateMutation();
  const [nextState, setNextState] = useState("");

  useEffect(() => {
    if (singleFinding) {
      setNextState(singleFinding.state || "");
    }
  }, [singleFinding]);

  useEffect(() => {
    const params = new URLSearchParams();
    severity.forEach((s) => params.append("severity", s));
    state.forEach((st) => params.append("state", st));
    toolType.forEach((t) => params.append("toolType", t));
    params.set("page", String(currentPage));
    params.set("size", String(pageSize));
    if (selectedFindingId) {
      params.set("findingId", selectedFindingId);
    }
    setSearchParams(params, { replace: true });
  }, [
    severity,
    state,
    toolType,
    currentPage,
    pageSize,
    selectedFindingId,
    setSearchParams,
  ]);

  const handleFilterChange = (newSeverity, newState, newToolType) => {
    setSeverity(newSeverity);
    setState(newState);
    setToolType(newToolType);
    setCurrentPage(1);
  };

  const handleTableChange = (newPage, newPageSize) => {
    setCurrentPage(newPage);
    setPageSize(newPageSize);
  };

  const onRowClick = (record) => {
    if (record && record.id) {
      setSelectedFindingId(record.id);
      setDrawerVisible(true);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedFindingId(null);
  };

  async function handleSaveState() {
    if (!singleFinding) return;
    try {
      await updateStateMutation({
        tool: singleFinding.toolType,
        alertNumber: singleFinding.toolAdditionalProperties?.number || 0,
        findingState: nextState,
        id: singleFinding.id,
      }).unwrap();

      setTimeout(() => {
        refetchSingleFinding();
        refetchFindings();
      }, 5000);
      message.success("Finding state updated successfully!");
    } catch (err) {
      const errMsg =
        err?.data?.message || err?.message || "Error updating finding state.";
      message.error(errMsg);
    }
  }

  return (
    <div className="findings-page-container">
      <div className="findings-page-header">
        <Title level={2} className="findings-page-title">
          Findings
        </Title>
      </div>

      {/* FILTER */}
      <div className="findings-filter-container">
        <FindingsFilter
          onFilterChange={handleFilterChange}
          defaultSeverity={severity}
          defaultState={state}
          defaultTool={toolType}
        />
      </div>

      {/* LOADING / ERROR / TABLE */}
      {isLoading && (
        <div className="findings-loading">
          <Spin size="large" tip="Loading Findings..." />
        </div>
      )}

      {/* Uncomment if you'd like to display a global error alert: 
      {isError && (
        <Alert
          message="Error"
          description={error?.data?.message || "Could not fetch findings."}
          type="error"
          showIcon
          className="findings-error-alert"
        />
      )} */}

      {data && data.data && (
        <FindingsTable
          dataSource={data.data.findings || []}
          currentPage={currentPage}
          pageSize={data.data.pageSize || pageSize}
          totalPages={data.data.totalPages}
          totalHits={data.data.totalHits || 0}
          onChange={handleTableChange}
          onRowClick={onRowClick}
        />
      )}

      {/* DRAWER (Single Finding Details) */}
      <Drawer
        title="Finding Details"
        placement="right"
        width={640}
        onClose={handleCloseDrawer}
        open={drawerVisible}
        destroyOnClose
        className="finding-details-drawer"
      >
        {isSingleFindingLoading && (
          <div className="drawer-loading">
            <Spin size="large" tip="Loading Finding..." />
          </div>
        )}

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

        {singleFinding && (
          <div className="drawer-content">
            {/* STATE UPDATE (Visible for SUPER_ADMIN) */}
            {roles.includes("SUPER_ADMIN") && (
              <div className="finding-state-update-section">
                <Typography.Title level={5} style={{ marginTop: 0 }}>
                  Update State
                </Typography.Title>
                <div className="state-update-controls">
                  <Select
                    style={{ width: "50%" }}
                    value={convertTextFormat(nextState || "")}
                    onChange={setNextState}
                    className="state-select"
                  >
                    {getPossibleNextStates(singleFinding.state || "").map(
                      (st) => (
                        <Select.Option key={st} value={st}>
                          {convertTextFormat(st)}
                        </Select.Option>
                      )
                    )}
                  </Select>
                  <Button
                    type="primary"
                    onClick={handleSaveState}
                    loading={isUpdatingState}
                    className="save-state-button"
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* TICKET ACTIONS */}
            <div className="ticket-actions-container">
              <Typography.Title level={5} style={{ marginBottom: 8 }}>
                Ticket Actions
              </Typography.Title>
              {singleFinding.ticketId ? (
                <Button
                  type="primary"
                  onClick={() => {
                    // Navigate to Tickets page, open the drawer for this ticket
                    window.location.href = `/tickets?ticketId=${singleFinding.ticketId}`;
                  }}
                >
                  View Ticket
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    // Navigate to Tickets page, open create modal, prefill fields
                    const summary = encodeURIComponent(
                      singleFinding.title || ""
                    );
                    const description = encodeURIComponent(
                      singleFinding.desc || ""
                    );
                    window.location.href = `/tickets?createTicket=1&findingId=${singleFinding.id}&summary=${summary}&description=${description}`;
                  }}
                >
                  Create Ticket
                </Button>
              )}
            </div>

            {/* FINDING DETAILS */}
            <div className="finding-main-info">
              <Typography.Title level={4} style={{ marginTop: "20px" }}>
                {singleFinding.title || "No Title"}
              </Typography.Title>
              <Typography.Paragraph type="secondary">
                {singleFinding.id || "No ID"}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>Tool:</strong>{" "}
                {convertTextFormat(singleFinding.toolType || "")}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>Severity:</strong> {singleFinding.severity || "N/A"}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>State:</strong>{" "}
                {convertTextFormat(singleFinding.state || "")}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>CVSS:</strong> {singleFinding.cvss || "N/A"}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>CVE:</strong> {singleFinding.cve || "N/A"}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>File Path:</strong>{" "}
                {singleFinding.filePath || "N/A"}
              </Typography.Paragraph>
              <Typography.Paragraph>
                <strong>CWEs:</strong>{" "}
                {!singleFinding.cwes || singleFinding.cwes.length === 0
                  ? "N/A"
                  : singleFinding.cwes.map((cwe, idx) => {
                      const match = cwe.match(/^CWE-(\d+)$/);
                      if (match) {
                        const cweNumber = match[1].replace(/^0+/, "");
                        const isLast = idx === singleFinding.cwes.length - 1;
                        return (
                          <a
                            key={`${cwe}-${idx}`}
                            href={`https://cwe.mitre.org/data/definitions/${cweNumber}.html`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {cwe}
                            {!isLast && ", "}
                          </a>
                        );
                      }
                      return (
                        <span key={`${cwe}-${idx}`} style={{ marginRight: 8 }}>
                          {cwe}
                        </span>
                      );
                    })}
              </Typography.Paragraph>
            </div>

            {/* DESCRIPTION */}
            <div className="finding-description">
              <Typography.Title level={5} style={{ marginTop: 16 }}>
                Description
              </Typography.Title>
              <div className="markdown-content">
                <ReactMarkdown>
                  {singleFinding.desc || "No description available."}
                </ReactMarkdown>
              </div>
            </div>

            {/* SUGGESTIONS */}
            {singleFinding.suggestions && (
              <div className="finding-suggestions">
                <Typography.Title level={5} style={{ marginTop: 16 }}>
                  Suggestions
                </Typography.Title>
                <div className="markdown-content">
                  <ReactMarkdown>
                    {singleFinding.suggestions || "No suggestions available."}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default FindingsPage;
