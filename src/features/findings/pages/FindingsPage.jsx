import { useState, useEffect } from "react";
import { Typography, Spin, Alert, Drawer, Button, message, Select } from "antd";
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

const { Title } = Typography;

// Helper to decide possible next states
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

  // 1) Initialize filters and pagination from URL
  const initialSeverity = searchParams.getAll("severity"); // e.g. ['HIGH', 'LOW']
  const initialState = searchParams.getAll("state");
  const initialToolType = searchParams.getAll("toolType");
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSize = parseInt(searchParams.get("size") || "10", 10);
  const initialFindingId = searchParams.get("findingId"); // if provided, open drawer

  // 2) Set local React state
  const [severity, setSeverity] = useState(initialSeverity);
  const [state, setState] = useState(initialState);
  const [toolType, setToolType] = useState(initialToolType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [selectedFindingId, setSelectedFindingId] = useState(initialFindingId);
  const [drawerVisible, setDrawerVisible] = useState(Boolean(initialFindingId));

  // 3) Query the findings list
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

  // 4) Query single finding (for the drawer)
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

  // 5) Mutation to update the finding state
  const [updateStateMutation, { isLoading: isUpdatingState }] =
    useUpdateStateMutation();
  const [nextState, setNextState] = useState("");

  useEffect(() => {
    if (singleFinding) {
      setNextState(singleFinding.state || "");
    }
  }, [singleFinding]);

  // 6) Sync React state back to URL
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
  }, [severity, state, toolType, currentPage, pageSize, selectedFindingId, setSearchParams]);

  // 7) Handlers
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
    try {
      if (record && record.id) {
        setSelectedFindingId(record.id);
        setDrawerVisible(true);
      } else {
        console.error("Row record is missing id:", record);
      }
    } catch (error) {
      console.error("Error in onRowClick:", error);
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
      }, 1200);
      message.success("Finding state updated successfully!");
    } catch (err) {
      const errMsg =
        err?.data?.message || err?.message || "Error updating finding state.";
      message.error(errMsg);
    }
  }

  return (
    <div className="findings-page">
      <Title level={2} className="findings-page-title">
        Findings
      </Title>

      <FindingsFilter
        onFilterChange={handleFilterChange}
        defaultSeverity={severity}
        defaultState={state}
        defaultTool={toolType}
      />

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

      {data && data.data && (
        <FindingsTable
          dataSource={data.data.findings || []}
          currentPage={currentPage}
          pageSize={data.data.pageSize || pageSize}
          totalPages={data.data.totalPages}
          totalHits={data.data.findingsCount || 0}
          onChange={handleTableChange}
          onRowClick={onRowClick}
        />
      )}

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
        {singleFinding && (
          <div>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              Update State
            </Typography.Title>
            <Select
              style={{ width: "50%" }}
              value={convertTextFormat(nextState || "")}
              onChange={setNextState}
            >
              {getPossibleNextStates(singleFinding.state || "").map((st) => (
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
            <Typography.Title level={4}>
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
              {(!singleFinding.cwes || singleFinding.cwes.length === 0)
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
            <Typography.Title level={5} style={{ marginTop: 16 }}>
              Description
            </Typography.Title>
            <div className="markdown-content">
              <ReactMarkdown>
                {singleFinding.desc || "No description available."}
              </ReactMarkdown>
            </div>
            {singleFinding.suggestions && (
              <>
                <Typography.Title level={5} style={{ marginTop: 16 }}>
                  Suggestions
                </Typography.Title>
                <div className="markdown-content">
                  <ReactMarkdown>
                    {singleFinding.suggestions || "No suggestions available."}
                  </ReactMarkdown>
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
