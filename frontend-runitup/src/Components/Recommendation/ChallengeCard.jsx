import React from "react";
import { Card, Progress, Button, Typography } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ChallengeCard = ({ challenge, onUpdate, isPast = false }) => {
  const progress = (challenge.currentProgress / challenge.target) * 100;
  const timeLeft = new Date(challenge.expiresAt) - new Date();
  const minutesLeft = Math.max(0, Math.floor(timeLeft / 60000));

  const getStatusColor = () => {
    switch (challenge.status) {
      case "completed":
        return "green";
      case "failed":
        return "red";
      default:
        return "blue";
    }
  };

  const renderChallengeDetails = () => {
    switch (challenge.type) {
      case "distance":
        return `${challenge.currentProgress.toFixed(2)} / ${
          challenge.target
        } miles`;
      case "calories":
        return `${Math.round(challenge.currentProgress)} / ${
          challenge.target
        } calories`;
      case "elevation":
        return `${Math.round(challenge.currentProgress)} / ${
          challenge.target
        } ft elevation`;
      default:
        return "";
    }
  };

  return (
    <Card
      title={challenge.description}
      extra={
        challenge.status === "completed" ? (
          <TrophyOutlined style={{ color: "gold" }} />
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
      />
      <Text strong>{renderChallengeDetails()}</Text>
      <br />
      {!isPast && challenge.status === "active" && (
        <Text type="secondary">Time left: {minutesLeft} minutes</Text>
      )}
      {isPast && (
        <Text type="secondary">
          Ended: {new Date(challenge.endDate).toLocaleString()}
        </Text>
      )}
      <br />
      {!isPast && challenge.status === "active" && (
        <Button
          type="primary"
          onClick={() => onUpdate(challenge.id, "completed")}
          disabled={progress < 100}
        >
          Mark as Completed
        </Button>
      )}
    </Card>
  );
};

export default ChallengeCard;
