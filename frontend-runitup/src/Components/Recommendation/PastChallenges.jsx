import React from "react";
import { List, Typography, Empty } from "antd";
import ChallengeCard from "./ChallengeCard";

const { Title } = Typography;

const PastChallenges = ({ challenges }) => {
  if (!challenges || challenges.length === 0) {
    return <Empty description="No past challenges found" />;
  }

  return (
    <div>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={challenges}
        renderItem={(challenge) => (
          <List.Item>
            <ChallengeCard challenge={challenge} isPast={true} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default PastChallenges;
