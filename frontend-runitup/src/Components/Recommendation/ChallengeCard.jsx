import React, { useState, useEffect } from "react";
import { Card, Progress, Button, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ChallengeCard = ({ challenge, onUpdate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge]);

  function calculateTimeLeft() {
    const difference = new Date(challenge.expiresAt) - new Date();
    return difference > 0 ? difference : 0;
  }

  const progress = (challenge.currentProgress / challenge.target) * 100;
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = ((timeLeft % 60000) / 1000).toFixed(0);

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
      {challenge.status === "active" && (
        <Text>
          Time left: {minutes}:{seconds.padStart(2, "0")}
        </Text>
      )}
      {challenge.status === "active" && progress >= 100 && (
        <Button onClick={() => onUpdate(challenge.id, "completed")}>
          Mark as Completed
        </Button>
      )}
    </Card>
  );
};

export default ChallengeCard;
