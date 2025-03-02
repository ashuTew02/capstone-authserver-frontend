import React from "react";
import { Drawer, Spin, Alert, Typography, Button, Select } from "antd";
import ReactMarkdown from "react-markdown";

import FindingDetailsKeyValueTable from "./FindingDetailsKeyValueTable";
import convertTextFormat from "../../../utils/convertToProperTextUtil";

import "./findingDetailsDrawer.css";

const { Title } = Typography;

/** Helper to get possible next states for a finding */
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

const FindingDetailsDrawer = ({
  visible,
  onClose,
  finding,
  isLoading,
  isError,
  error,
  nextState,
  setNextState,
  onSaveState,
  isUpdatingState,
  roles,
}) => {
  return (
    <Drawer
      title="Finding Details"
      placement="right"
      width={740}
      onClose={onClose}
      open={visible}
      destroyOnClose
      className="finding-details-drawer"
      maskStyle={{ backdropFilter: "blur(4px)" }} // Subtle glass effect
    >
      {isLoading && (
        <div className="drawer-loading">
          <Spin size="large" tip="Loading Finding..." />
        </div>
      )}

      {isError && (
        <Alert
          message="Error"
          description={
            error?.data?.message || "Could not fetch finding details."
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {finding && (
        <div className="drawer-content">
          {/* 
            1) FINDING TITLE:
               Display the finding's title at the top in a fancy style 
          */}
          <Title level={3} className="drawer-finding-title">
            {finding.title || "Untitled Finding"}
          </Title>

          {/* 
            2) ACTIONS ROW:
               Update State (if SUPER_ADMIN) and Ticket Actions side by side 
          */}
          <div className="finding-actions-row">
            {/* UPDATE STATE (Visible for SUPER_ADMIN) */}
            {roles.includes("SUPER_ADMIN") && (
              <div className="finding-state-update-section">
                <div className="state-update-row">
                  <span className="state-update-label">Update State:</span>
                  <Select
                    style={{ width: 180 }}
                    value={convertTextFormat(nextState || "")}
                    onChange={setNextState}
                    className="state-select"
                  >
                    {getPossibleNextStates(finding.state || "").map((st) => (
                      <Select.Option key={st} value={st}>
                        {convertTextFormat(st)}
                      </Select.Option>
                    ))}
                  </Select>
                  <Button
                    type="primary"
                    onClick={onSaveState}
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
              {finding.ticketId ? (
                <Button
                  type="primary"
                  onClick={() =>
                    (window.location.href = `/tickets?ticketId=${finding.ticketId}`)
                  }
                  className="ticket-action-button"
                >
                  View Ticket
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => {
                    const summary = encodeURIComponent(finding.title || "");
                    const description = encodeURIComponent(finding.desc || "");
                    window.location.href = `/tickets?createTicket=1&findingId=${finding.id}&summary=${summary}&description=${description}`;
                  }}
                  className="ticket-action-button"
                >
                  Create Ticket
                </Button>
              )}
            </div>
          </div>

          {/* 
            3) KEY-VALUE DETAILS SECTION:
               We use the "FindingDetailsKeyValueTable" for a nice layout 
          */}
          <FindingDetailsKeyValueTable finding={finding} />

          {/* 
            4) DESCRIPTION
          */}
          <div className="finding-description">
            <Title level={5} style={{ marginTop: 16 }}>
              Description
            </Title>
            <div className="markdown-content">
              <ReactMarkdown>
                {finding.desc || "No description available."}
              </ReactMarkdown>
            </div>
          </div>

          {/* 
            5) SUGGESTIONS
          */}
          {finding.suggestions && (
            <div className="finding-suggestions">
              <Title level={5} style={{ marginTop: 16 }}>
                Suggestions
              </Title>
              <div className="markdown-content">
                <ReactMarkdown>
                  {finding.suggestions || "No suggestions available."}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default FindingDetailsDrawer;
