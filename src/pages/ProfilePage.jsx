// src/pages/ProfilePage.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Typography, Card, Avatar, Row, Col } from "antd";
import convertTextFormat from "../utils/convertToProperTextUtil";

const { Title, Paragraph } = Typography;

function ProfilePage() {
  const { user, currentTenant } = useSelector((state) => state.auth);
  if (!user) {
    return <div style={{ padding: 24 }}>No user data available</div>;
  }
  console.log(user.imageUrl);

  return (
    <Row justify="center" style={{ marginTop: 24 }}>
      <Col xs={24} sm={16} md={12} lg={10}>
        <Card style={{ borderRadius: 8, textAlign: "center" }}>
          <Avatar
            src={user?.imageUrl}
            size={100}
            style={{ marginBottom: 16 }}
          />
          <Title level={3} style={{ marginBottom: 0 }}>
            {user.name || "User"}
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {convertTextFormat(currentTenant?.roleName) || "No Role"}
          </Paragraph>

          <div style={{ textAlign: "left", marginTop: 16 }}>
            <Paragraph>
              <strong>Email:</strong> {user.email}
            </Paragraph>
            {/* <Paragraph>
              <strong>Provider:</strong> {user.provider || "N/A"}
            </Paragraph>
            <Paragraph>
              <strong>Default Tenant:</strong> {user.defaultTenantId}
            </Paragraph>
            <Paragraph>
              <strong>OAuth ID:</strong> {user.oauthId || "N/A"}
            </Paragraph>
            <Paragraph>
              <strong>Created At:</strong> {user.createdAt}
            </Paragraph>
            <Paragraph>
              <strong>Updated At:</strong> {user.updatedAt}
            </Paragraph> */}
          </div>
        </Card>
      </Col>
    </Row>
  );
}

export default ProfilePage;
