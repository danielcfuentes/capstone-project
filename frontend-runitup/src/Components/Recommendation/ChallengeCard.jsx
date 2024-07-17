import React from "react";
import { Card, Progress, Button, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

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

  return (
    <Card
      title={challenge.description}
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
      />
      <Text>
        Progress: {challenge.currentProgress.toFixed(2)} / {challenge.target}
      </Text>
      <br />
      {challenge.status === "active" && <Text>Time left: {getTimeLeft()}</Text>}
      {challenge.status === "active" && progress >= 100 && (
        <Button onClick={() => onUpdate(challenge.id, "completed")}>
          Mark as Completed
        </Button>
      )}
    </Card>
  );
};

export default ChallengeCard;
