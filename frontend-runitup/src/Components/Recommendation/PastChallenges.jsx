import React from "react";
import { List, Typography } from "antd";
import ChallengeCard from "./ChallengeCard";

const { Title } = Typography;

const PastChallenges = ({ challenges }) => {
  return (
    <div>
      <Title level={3}>Completed and Failed Challenges</Title>
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
