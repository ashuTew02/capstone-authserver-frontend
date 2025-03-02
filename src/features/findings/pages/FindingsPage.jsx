import { useState, useEffect } from "react";
import { Typography, Spin, Alert, message } from "antd";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import FindingsFilter from "../components/FindingsFilter";
import FindingsTable from "../components/FindingsTable";
import FindingDetailsDrawer from "../components/FindingDetailsDrawer";

import {
  useGetFindingsQuery,
  useGetFindingByIdQuery,
  useUpdateStateMutation,
} from "../../../api/findingsApi";

import "./findingsPage.css"; // Additional page-level styling

const { Title } = Typography;

function FindingsPage() {
  // Query params
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSeverity = searchParams.getAll("severity");
  const initialState = searchParams.getAll("state");
  const initialToolType = searchParams.getAll("toolType");
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSize = parseInt(searchParams.get("size") || "10", 10);
  const initialFindingId = searchParams.get("findingId");

  // Local state for filters & pagination
  const [severity, setSeverity] = useState(initialSeverity);
  const [state, setState] = useState(initialState);
  const [toolType, setToolType] = useState(initialToolType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);

  // Drawer logic
  const [selectedFindingId, setSelectedFindingId] = useState(initialFindingId);
  const [drawerVisible, setDrawerVisible] = useState(Boolean(initialFindingId));

  // User roles (to display certain features only for certain roles)
  const roles = useSelector((store) => [store.auth?.currentTenant?.roleName]);

  // Fetch Findings
  const {
    data: findingsData,
    isLoading: isFindingsLoading,
    isError: isFindingsError,
    error: findingsError,
    refetch: refetchFindings,
  } = useGetFindingsQuery({
    severity,
    state,
    toolType,
    page: currentPage - 1,
    size: pageSize,
  });

  // Fetch Single Finding
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

  // Update state mutation
  const [updateStateMutation, { isLoading: isUpdatingState }] =
    useUpdateStateMutation();

  // Keep a local nextState for the single finding’s state update
  const [nextState, setNextState] = useState("");

  useEffect(() => {
    if (singleFinding) {
      setNextState(singleFinding.state || "");
    }
  }, [singleFinding]);

  // Sync changes to URL search params
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

  // Handlers
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

      // Give some time for changes to reflect
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

  // Render
  return (
    <div className="findings-page-container" style={{overflow: "hidden"}}>
      <div className="findings-page-header">
        <Title level={2} className="findings-page-title">
          Findings
        </Title>
      </div>

      {/* Filter */}
      <div className="findings-filter-container">
        <FindingsFilter
          onFilterChange={handleFilterChange}
          defaultSeverity={severity}
          defaultState={state}
          defaultTool={toolType}
        />
      </div>

      {/* Loading / Error / Table */}
      {isFindingsLoading && (
        <div className="findings-loading">
          <Spin size="large" tip="Loading Findings..." />
        </div>
      )}

      {isFindingsError && (
        <Alert
          message="Error"
          description={
            findingsError?.data?.message || "Could not fetch findings."
          }
          type="error"
          showIcon
          className="findings-error-alert"
        />
      )}

      {findingsData && findingsData.data && (
        <FindingsTable
          dataSource={findingsData.data.findings || []}
          currentPage={currentPage}
          pageSize={findingsData.data.pageSize || pageSize}
          totalPages={findingsData.data.totalPages}
          totalHits={findingsData.data.totalHits || 0}
          onChange={handleTableChange}
          onRowClick={onRowClick}
        />
      )}

      {/* Single Finding Drawer */}
      <FindingDetailsDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        finding={singleFinding}
        isLoading={isSingleFindingLoading}
        isError={isSingleFindingError}
        error={singleFindingError}
        nextState={nextState}
        setNextState={setNextState}
        onSaveState={handleSaveState}
        isUpdatingState={isUpdatingState}
        roles={roles}
      />
    </div>
  );
}

export default FindingsPage;
