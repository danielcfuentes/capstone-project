import React from "react";
import { Card, Progress, Button, Typography } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DashboardOutlined,
  FireOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import "../../styles/ChallengeCard.css";

const { Text, Title } = Typography;

const ChallengeCard = ({ challenge, onUpdate }) => {
  const progress = (challenge.currentProgress / challenge.target) * 100;

  const getTimeLeft = () => {
    const now = new Date();
    const end = new Date(challenge.expiresAt);
    const timeLeft = end - now;
    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hoursLeft}h ${minutesLeft}m`;
  };

  const getIcon = () => {
    switch (challenge.type) {
      case "distance":
        return <DashboardOutlined />; // Using DashboardOutlined for distance
      case "calories":
        return <FireOutlined />;
      case "elevation":
        return <AreaChartOutlined />; // Using AreaChartOutlined for elevation
      default:
        return null;
    }
  };

  return (
    <Card
      className={`challenge-card ${challenge.status}`}
      title={
        <Title level={4}>
          {getIcon()} {challenge.description}
        </Title>
      }
      extra={
        challenge.status === "completed" ? (
          <CheckOutlined style={{ color: "green" }} />
        ) : challenge.status === "failed" ? (
          <CloseOutlined style={{ color: "red" }} />
        ) : null
      }
    >
      <Progress
        percent={Math.min(progress, 100)}
        status={
          challenge.status === "completed"
            ? "success"
            : challenge.status === "failed"
            ? "exception"
            : "active"
        }
        strokeColor={{
          "0%": "#108ee9",
          "100%": "#87d068",
        }}
      />
      <Text className="progress-text">
        Progress: {challenge.currentProgress.toFixed(2)} / {challenge.target}
      </Text>
      <br />
      {challenge.status === "active" && (
        <Text className="time-left">Time left: {getTimeLeft()}</Text>
      )}
      {challenge.status === "active" && progress >= 100 && (
        <Button
          onClick={() => onUpdate(challenge.id, "completed")}
          className="complete-button"
        >
          Mark as Completed
        </Button>
      )}
    </Card>
  );
};

export default ChallengeCard;
