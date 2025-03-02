import React, { useState, useEffect } from "react";
import { Button, Typography, message, Space, Spin } from "antd";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useMarkTicketDoneMutation,
} from "../../../api/ticketsApi";
import { useGetFindingByIdQuery } from "../../../api/findingsApi";

import TicketsTable from "../components/TicketsTable";
import TicketDetailsDrawer from "../components/TicketDetailsDrawer";
import CreateTicketModal from "../components/CreateTicketModal";

import "./ticketsPage.css";

const { Title, Text } = Typography;

function TicketsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ===================== Tickets =====================
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    isError: isTicketsError,
    error: ticketsError,
    refetch: refetchTickets,
  } = useGetTicketsQuery();

  // ===================== Single Ticket =====================
  const initialTicketId = searchParams.get("ticketId");
  const [selectedTicketId, setSelectedTicketId] = useState(initialTicketId || "");

  const {
    data: singleTicketData,
    isLoading: isSingleTicketLoading,
    isError: isSingleTicketError,
    error: singleTicketError,
    refetch: refetchSingleTicket,
  } = useGetTicketByIdQuery(selectedTicketId, {
    skip: !selectedTicketId,
  });

  // If the single ticket references a finding:
  const esFindingId = singleTicketData?.data?.esFindingId;
  const {
    data: attachedFindingData,
    isLoading: isAttachedFindingLoading,
  } = useGetFindingByIdQuery(esFindingId, {
    skip: !esFindingId,
  });

  // ===================== Mutations: Create & MarkDone =====================
  const [createTicket, { isLoading: isCreating }] = useCreateTicketMutation();
  const [markTicketDone, { isLoading: isMarkingDone }] = useMarkTicketDoneMutation();

  // ===================== Create Modal State =====================
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFindingId, setCreateFindingId] = useState("");
  const [createSummary, setCreateSummary] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  // ===================== Ticket Drawer State =====================
  const [drawerVisible, setDrawerVisible] = useState(false);

  // ===================== Effects =====================
  // If createTicket=1 in query params, open the modal
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

  // Open/close the drawer if a ticketId is selected
  useEffect(() => {
    setDrawerVisible(!!selectedTicketId);
  }, [selectedTicketId]);

  // ===================== Handlers =====================
  /** Open the ticket drawer for the specified ticket ID */
  const openTicketDrawer = (ticketId) => {
    navigate(`/tickets?ticketId=${ticketId}`);
    setSelectedTicketId(ticketId);
  };

  /** Close the ticket drawer and reset state */
  const closeDrawer = () => {
    setSelectedTicketId("");
    setDrawerVisible(false);
    navigate("/tickets", { replace: true });
  };

  /** Show the create ticket modal */
  const showCreateModal = () => {
    setCreateFindingId("");
    setCreateSummary("");
    setCreateDescription("");
    setIsCreateModalOpen(true);
    navigate("/tickets?createTicket=1", { replace: true });
  };

  /** Hide the create ticket modal and clear URL params */
  const hideCreateModal = () => {
    setIsCreateModalOpen(false);
    navigate("/tickets", { replace: true });
  };

  /** Actually create the ticket */
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

  /** Mark the ticket as Done in Jira */
  const handleMarkDone = async () => {
    if (!selectedTicketId) return;
    try {
      await markTicketDone({ ticketId: selectedTicketId, findingId: esFindingId }).unwrap();
      message.success("Ticket marked as Done.");
      refetchTickets();
      refetchSingleTicket();
    } catch (err) {
      message.error(err?.data?.message || "Failed to mark ticket as Done.");
    }
  };

  // ===================== Render =====================
  return (
    <div className="tickets-page-container">
      {/* PAGE HEADER */}
      <div className="tickets-page-header">
        <Title level={2} className="tickets-page-title">
          Tickets
        </Title>
        <Button type="primary" size="large" onClick={showCreateModal} className="create-ticket-button">
          Create Ticket
        </Button>
      </div>

      {/* ERROR MESSAGE (if any) */}
      {isTicketsError && (
        <Text type="danger" className="error-text">
          {ticketsError?.data?.message || "Failed to load tickets. Please try again."}
        </Text>
      )}

      {/* TICKETS TABLE */}
      {isTicketsLoading ? (
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Spin size="large" tip="Loading Tickets..." />
        </div>
      ) : (
        <TicketsTable
          tickets={ticketsData?.data || []}
          onRowClick={(record) => openTicketDrawer(record.ticketId)}
        />
      )}

      {/* CREATE TICKET MODAL */}
      <CreateTicketModal
        visible={isCreateModalOpen}
        onCancel={hideCreateModal}
        onOk={handleCreateTicket}
        confirmLoading={isCreating}
        findingId={createFindingId}
        setFindingId={setCreateFindingId}
        summary={createSummary}
        setSummary={setCreateSummary}
        description={createDescription}
        setDescription={setCreateDescription}
        attachedFindingData={attachedFindingData}
        isAttachedFindingLoading={isAttachedFindingLoading}
      />

      {/* SINGLE TICKET DRAWER */}
      <TicketDetailsDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        ticketData={singleTicketData?.data}
        isLoading={isSingleTicketLoading}
        isError={isSingleTicketError}
        error={singleTicketError}
        onMarkDone={handleMarkDone}
        isMarkingDone={isMarkingDone}
      />
    </div>
  );
}

export default TicketsPage;
