import React, { useState, useEffect } from "react";
import { Layout, Typography, List, message } from "antd";
import { getHeaders } from "../../utils/apiConfig";
import ChallengeCard from "./ChallengeCard";

const { Content } = Layout;
const { Title } = Typography;

const RecommendationPage = () => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/challenges`,
        {
          headers: getHeaders(),
        }
      );
      const data = await response.json();
      setActiveChallenges(data.filter((challenge) => !challenge.isCompleted));
      setCompletedChallenges(data.filter((challenge) => challenge.isCompleted));
    } catch (error) {
      message.error("Failed to fetch challenges");
    }
  };

  const handleChallengeComplete = async (challengeId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/challenges/${challengeId}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ isCompleted: true }),
        }
      );
      if (response.ok) {
        message.success("Challenge completed!");
        fetchChallenges(); // Refresh challenges
      }
    } catch (error) {
      message.error("Failed to complete challenge");
    }
  };

  return (
    <Layout>
      <Content style={{ padding: "50px" }}>
        <Title level={2}>Your Active Challenges</Title>
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={activeChallenges}
          renderItem={(challenge) => (
            <List.Item>
              <ChallengeCard
                challenge={challenge}
                onComplete={handleChallengeComplete}
              />
            </List.Item>
          )}
        />

        <Title level={2} style={{ marginTop: "50px" }}>
          Completed Challenges
        </Title>
        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={completedChallenges}
          renderItem={(challenge) => (
            <List.Item>
              <ChallengeCard challenge={challenge} completed />
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
};

export default RecommendationPage;
