import { Typography, Card } from "antd";
import "./dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Typography.Title level={2} className="dashboard-title">
        Dashboard
      </Typography.Title>

      {/* Example card */}
      <Card className="dashboard-card" hoverable>
        <Typography.Text>
          Welcome to your ArmorCode-like dashboard. This is a placeholder. You
          can add charts, stats, or other data here.
        </Typography.Text>
      </Card>
    </div>
  );
}

export default Dashboard;
