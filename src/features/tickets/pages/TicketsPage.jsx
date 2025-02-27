import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Drawer,
  Space,
  Tag,
  message,
  Typography,
} from "antd";
import {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useMarkTicketDoneMutation,
} from "../../../api/ticketsApi";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGetFindingByIdQuery } from "../../../api/findingsApi"; // for optional finding details
import "./ticketsPage.css";

const { Title, Text } = Typography;

function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ============== Tickets List ==============
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
    refetch: refetchTickets,
  } = useGetTicketsQuery();

  // ============== Single Ticket Query =============
  const initialTicketId = searchParams.get("ticketId");
  const [selectedTicketId, setSelectedTicketId] = useState(initialTicketId || "");

  const {
    data: singleTicketData,
    isLoading: isSingleTicketLoading,
    refetch: refetchSingleTicket,
  } = useGetTicketByIdQuery(selectedTicketId, {
    skip: !selectedTicketId,
  });

  // We also might fetch the attached finding, if available
  const esFindingId = singleTicketData?.data?.esFindingId || "";
  const {
    data: attachedFindingData,
    isLoading: isAttachedFindingLoading,
  } = useGetFindingByIdQuery(esFindingId, {
    skip: !esFindingId,
  });

  // ============== Create Ticket Mutation =============
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();

  // ============== Mark Ticket Done Mutation =============
  const [markTicketDone, { isLoading: isMarkingDone }] = useMarkTicketDoneMutation();

  // ============== Create Modal State =============
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFindingId, setCreateFindingId] = useState("");
  const [createSummary, setCreateSummary] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  // ============== Drawer State =============
  const [drawerVisible, setDrawerVisible] = useState(false);

  // ============== Effects =============
  // Check if we should open create modal from query params
  useEffect(() => {
    const shouldOpenCreate = searchParams.get("createTicket") === "1";
    if (shouldOpenCreate) {
      setCreateFindingId(searchParams.get("findingId") || "");
      setCreateSummary(searchParams.get("summary") || "");
      setCreateDescription(searchParams.get("description") || "");
      setIsCreateModalOpen(true);
    } else {
      setIsCreateModalOpen(false);
    }
  }, [searchParams]);

  // If selectedTicketId is set, open drawer
  useEffect(() => {
    setDrawerVisible(!!selectedTicketId);
  }, [selectedTicketId]);

  // ============== Handlers =============
  const openTicketDrawer = (ticketId) => {
    navigate(`/tickets?ticketId=${ticketId}`);
    setSelectedTicketId(ticketId);
  };

  const closeDrawer = () => {
    setSelectedTicketId("");
    setDrawerVisible(false);
    // Clear the URL
    navigate("/tickets", { replace: true });
  };

  const onRowClick = (record) => {
    openTicketDrawer(record.ticketId);
  };

  const handleCreateTicket = async () => {
    if (!createFindingId) {
      message.error("Finding ID is required to create a ticket!");
      return;
    }
    try {
      const payload = {
        findingId: createFindingId,
        summary: createSummary,
        description: createDescription,
      };
      const resp = await createTicket(payload).unwrap();
      message.success(`Ticket created successfully. ID: ${resp?.data}`);
      setIsCreateModalOpen(false);
      navigate("/tickets", { replace: true });
      refetchTickets();
    } catch (err) {
      message.error(err?.data?.message || "Failed to create ticket.");
    }
  };

  const handleMarkDone = async () => {
    if (!selectedTicketId) return;
    try {
      await markTicketDone({ticketId: selectedTicketId, findingId: esFindingId}).unwrap();
      message.success("Ticket marked as Done.");
      refetchTickets();
      refetchSingleTicket();
    } catch (err) {
      message.error(err?.data?.message || "Failed to mark ticket as Done.");
    }
  };

  // ============== Table Definition =============
  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "ticketId",
      key: "ticketId",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      render: (text) => <span>{text || "No summary"}</span>,
    },
    {
      title: "Status",
      dataIndex: "statusName",
      key: "statusName",
      render: (status) => {
        let color = "blue";
        if (status?.toLowerCase() === "in progress") color = "orange";
        else if (status?.toLowerCase() === "done") color = "green";
        return <Tag color={color}>{status || "Unknown"}</Tag>;
      },
    },
  ];

  // ============== Render =============
  return (
    <div className="tickets-page-container">
      <div className="tickets-page-header">
        <Title level={2} className="tickets-page-title">
          Tickets
        </Title>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setCreateFindingId("");
            setCreateSummary("");
            setCreateDescription("");
            setIsCreateModalOpen(true);
            navigate("/tickets?createTicket=1", { replace: true });
          }}
          className="create-ticket-button"
        >
          Create Ticket
        </Button>
      </div>

      {isTicketsError && (
        <Text type="danger" className="error-text">
          Failed to load tickets. Please try again.
        </Text>
      )}

      <div className="tickets-table-container">
        <Table
          columns={columns}
          dataSource={ticketsData?.data || []}
          loading={isTicketsLoading}
          rowKey="ticketId"
          pagination={false}
          onRow={(record) => ({
            onClick: () => onRowClick(record),
            style: { cursor: "pointer" },
          })}
          className="tickets-table"
        />
      </div>

      {/* CREATE TICKET MODAL */}
      <Modal
        title="Create a New Ticket"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          navigate("/tickets", { replace: true });
        }}
        onOk={handleCreateTicket}
        okButtonProps={{ loading: isCreating }}
        className="create-ticket-modal"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div className="form-field">
            <Text strong>Finding ID:</Text>
            <Input
              placeholder="Enter a valid Finding ID"
              value={createFindingId}
              onChange={(e) => setCreateFindingId(e.target.value)}
              className="form-input"
            //   disabled={initialTicketId}
            />
          </div>

          <div className="form-field">
            <Text strong>Summary:</Text>
            <Input
              placeholder="Short summary"
              value={createSummary}
              onChange={(e) => setCreateSummary(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <Text strong>Description:</Text>
            <Input.TextArea
              rows={4}
              placeholder="Detailed description"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              className="form-input"
            />
          </div>

          {/* If we have a partial finding, show minimal info */}
          {createFindingId &&
            !isAttachedFindingLoading &&
            attachedFindingData?.data?.id === createFindingId && (
              <div className="linked-finding-info">
                <Title level={5} style={{ marginBottom: 8 }}>
                  Linked Finding
                </Title>
                <p>
                  <strong>Title:</strong> {attachedFindingData.data.title}
                </p>
                <p>
                  <strong>Severity:</strong> {attachedFindingData.data.severity}
                </p>
              </div>
            )}
        </Space>
      </Modal>

      {/* SINGLE TICKET DRAWER */}
      <Drawer
        title={`Ticket Details: ${selectedTicketId || ""}`}
        placement="right"
        width={500}
        onClose={closeDrawer}
        open={drawerVisible}
        destroyOnClose
        className="ticket-details-drawer"
      >
        {isSingleTicketLoading && <p className="drawer-loading">Loading ticket details...</p>}

        {!isSingleTicketLoading && singleTicketData?.data && (
          <div className="drawer-content">
            <div className="ticket-details-section">
              <p className="ticket-details-field">
                <Text strong>Issue Type:</Text>{" "}
                {singleTicketData.data.issueTypeName}
              </p>
              <p className="ticket-details-field">
                <Text strong>Issue Description:</Text>{" "}
                {singleTicketData.data.issueTypeDescription}
              </p>
              <p className="ticket-details-field">
                <Text strong>Summary:</Text> {singleTicketData.data.summary}
              </p>
              <p className="ticket-details-field">
                <Text strong>Status:</Text>{" "}
                <Tag
                  color={
                    singleTicketData.data.statusName?.toLowerCase() === "done"
                      ? "green"
                      : singleTicketData.data.statusName?.toLowerCase() === "in progress"
                      ? "orange"
                      : "blue"
                  }
                >
                  {singleTicketData.data.statusName}
                </Tag>
              </p>
            </div>

            <div className="drawer-footer">
              {esFindingId && (
                <Button
                  onClick={() => {
                    // Navigate to the finding page's drawer
                    window.location.href = `/findings?findingId=${esFindingId}`;
                  }}
                  className="view-finding-button"
                >
                  View Attached Finding
                </Button>
              )}

              <Button
                type="primary"
                onClick={handleMarkDone}
                loading={isMarkingDone}
                disabled={
                  singleTicketData.data.statusName?.toLowerCase() === "done"
                }
                className="mark-done-button"
              >
                Mark as Done
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default TicketsPage;
