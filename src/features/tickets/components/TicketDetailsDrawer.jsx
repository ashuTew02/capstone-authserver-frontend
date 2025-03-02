import React from "react";
import { Drawer, Spin, Alert, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

import TicketDetailsKeyValueTable from "./TicketDetailsKeyValueTable";

import "./ticketDetailsDrawer.css";

/**
 * @param {Object} props
 * @param {boolean} props.visible - Whether the drawer is visible
 * @param {Function} props.onClose - Callback to close the drawer
 * @param {Object} props.ticketData - The single ticket object from the server
 * @param {boolean} props.isLoading - Whether the ticket is still loading
 * @param {boolean} props.isError - Whether an error occurred while fetching the ticket
 * @param {Object} props.error - The error object (if any)
 * @param {Function} props.onMarkDone - Called when user clicks "Mark as Done"
 * @param {boolean} props.isMarkingDone - Whether "mark done" is still in progress
 */
function TicketDetailsDrawer({
  visible,
  onClose,
  ticketData,
  isLoading,
  isError,
  error,
  onMarkDone,
  isMarkingDone,
}) {
  // We’ll also assume we might need the “View Attached Finding” button:
  const attachedFindingId = ticketData?.esFindingId;

  return (
    <Drawer
      title="Ticket Details"
      placement="right"
      width={520}
      onClose={onClose}
      open={visible}
      destroyOnClose
      className="ticket-details-drawer"
      maskStyle={{ backdropFilter: "blur(4px)" }} // blur the background
    >
      {isLoading && (
        <div className="drawer-loading">
          <Spin size="large" tip="Loading Ticket..." />
        </div>
      )}

      {isError && (
        <Alert
          message="Error"
          description={error?.data?.message || "Failed to load ticket details."}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {!isLoading && ticketData && (
        <div className="drawer-content">
          {/* Key-Value table for the ticket details */}
          <TicketDetailsKeyValueTable ticketData={ticketData} />

          {/* Action buttons in a row at the bottom */}
          <div className="drawer-footer">
            {/* View Attached Finding Button */}
            {attachedFindingId && (
              <Button
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  // Navigate to the finding page's drawer
                  window.location.href = `/findings?findingId=${attachedFindingId}`;
                }}
                className="view-finding-button"
              >
                View Attached Finding
              </Button>
            )}

            {/* Mark Done Button */}
            <Button
              type="primary"
              onClick={onMarkDone}
              loading={isMarkingDone}
              disabled={ticketData.statusName?.toLowerCase() === "done"}
              className="mark-done-button"
            >
              Mark as Done
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}

export default TicketDetailsDrawer;
