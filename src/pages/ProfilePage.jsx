// src/pages/ProfilePage.jsx

import React from "react";
import { Card, Descriptions, Table, Button, message, Avatar } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useGetUserTenantsQuery, useSwitchTenantMutation } from "../api/authApi";
import { setCredentials } from "../features/auth/authSlice";
import convertTextFormat from "../utils/convertToProperTextUtil";
import "./profileStyles.css";

export default function ProfilePage() {
  const dispatch = useDispatch();
  
  const { user, currentTenant } = useSelector((state) => state.auth);
  const { data: tenantsData } = useGetUserTenantsQuery();
  const [doSwitchTenant, switchTenantState] = useSwitchTenantMutation();

  // Called when user clicks the "Switch" button in the table
  const handleTenantSwitch = async (tenantId) => {
    try {
      const result = await doSwitchTenant(tenantId).unwrap();
      const newToken = result.data.token;
      dispatch(setCredentials({ token: newToken }));
      window.location.reload();
      message.success(`Switched to tenant ${tenantId} successfully!`);
    } catch (err) {
      console.error("Tenant switch error:", err);
      message.error("Failed to switch tenant");
    }
  };

  // Setup columns for the Tenants table
  const columns = [
    {
      title: "Tenant ID",
      dataIndex: "tenantId",
      key: "tenantId",
      width: 100,
    },
    {
      title: "Tenant Name",
      dataIndex: "tenantName",
      key: "tenantName",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      render: (role) => convertTextFormat(role),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => {
        const isCurrentTenant = record.tenantId === currentTenant?.tenantId;
        return isCurrentTenant ? (
          <Button type="primary" disabled>
            Current
          </Button>
        ) : (
          <Button
            type="default"
            onClick={() => handleTenantSwitch(record.tenantId)}
            loading={switchTenantState.isLoading}
          >
            Switch
          </Button>
        );
      },
    },
  ];

  return (
    <div className="profile-page-container fade-in-up">
      {/* Top Card with user info */}
      <Card className="profile-card" bordered={false}>
        <div className="profile-top-section">
          <Avatar
            src={user?.imageUrl}
            size={100}
            icon={!user?.imageUrl && <img src="/defaultProfile.png" alt="default" />}
            style={{ border: "2px solid #d65a31" }}
          />
          <div className="profile-user-info">
            <h2 className="profile-username">{user?.name || "User"}</h2>
            <p className="profile-email">{user?.email || "N/A"}</p>
            <p className="profile-role">
              {currentTenant 
                ? `Current Role: ${convertTextFormat(currentTenant?.roleName)}`
                : "No Role"}
            </p>
          </div>
        </div>
      </Card>

      {/* Additional details if you want them in a Descriptions layout */}
      <Card className="profile-card" bordered={false}>
        <Descriptions bordered column={1} size="small" labelStyle={{ fontWeight: "bold" }}>
        <Descriptions.Item label="User ID">
            {user?.id || "N/A"}
          </Descriptions.Item>
        <Descriptions.Item label="Name">
            {user?.name || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user?.email || "N/A"}
          </Descriptions.Item>
          
          <Descriptions.Item label="Default Tenant">
            {tenantsData?.data?.find((tenant) => tenant.tenantId === user?.defaultTenantId)?.tenantName || "N/A"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Tenants List */}
      <Card
        title="Tenants & Roles"
        className="profile-card"
        bordered={false}
        style={{ marginTop: 24 }}
      >
        <Table
          columns={columns}
          dataSource={tenantsData?.data || []}
          rowKey="tenantId"
          pagination={false}
        />
      </Card>
    </div>
  );
}
