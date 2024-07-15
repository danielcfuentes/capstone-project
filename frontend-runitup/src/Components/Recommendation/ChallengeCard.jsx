import React from "react";
import { Card, Progress, Button } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const ChallengeCard = ({ challenge, onComplete, completed }) => {
  const progress = (challenge.currentProgress / challenge.target) * 100;

  return (
    <Card
      className={`challenge-card ${
        completed ? "completed-challenge-card" : ""
      }`}
      title={challenge.description}
      extra={completed && <TrophyOutlined className="trophy-icon" />}
    >
      <Progress
        percent={Math.min(progress, 100)}
        status={completed ? "success" : "active"}
      />
      <p className="challenge-info">
        Progress: {challenge.currentProgress.toFixed(2)} / {challenge.target}{" "}
        miles
      </p>
      <p className="challenge-info">
        End Date: {new Date(challenge.endDate).toLocaleDateString()}
      </p>
      {!completed && progress >= 100 && (
        <Button
          type="primary"
          onClick={() => onComplete(challenge.id)}
          className="challenge-complete-button"
        >
          Mark as Completed
        </Button>
      )}
    </Card>
  );
};

export default ChallengeCard;
