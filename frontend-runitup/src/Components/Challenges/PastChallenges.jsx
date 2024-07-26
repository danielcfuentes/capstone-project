import React, { useState } from "react";
import { List, Typography, Empty, Pagination } from "antd";
import ChallengeCard from "./ChallengeCard";
import "../../styles/PastChallenges.css";

const { Title } = Typography;

const PastChallenges = ({ challenges }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const challengesPerPage = 9;

  if (!challenges || challenges.length === 0) {
    return <Empty description="No past challenges found" />;
  }

  const indexOfLastChallenge = currentPage * challengesPerPage;
  const indexOfFirstChallenge = indexOfLastChallenge - challengesPerPage;
  const currentChallenges = challenges.slice(
    indexOfFirstChallenge,
    indexOfLastChallenge
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="past-challenges">
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
        dataSource={currentChallenges}
        renderItem={(challenge) => (
          <List.Item>
            <ChallengeCard challenge={challenge} isPast={true} />
          </List.Item>
        )}
      />
      <div className="pagination-container">
        <Pagination
          current={currentPage}
          total={challenges.length}
          pageSize={challengesPerPage}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper={false}
        />
      </div>
    </div>
  );
};

export default PastChallenges;
