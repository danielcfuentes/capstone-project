import React from "react";
import { List, Typography, Empty } from "antd";
import ChallengeCard from "./ChallengeCard";
import "../../styles/PastChallenges.css";

const { Title } = Typography;

const PastChallenges = ({ challenges }) => {
  if (!challenges || challenges.length === 0) {
    return <Empty description="No past challenges found" />;
  }

  return (
    <div className="past-challenges">
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
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
