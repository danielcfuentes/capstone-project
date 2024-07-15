import React, { useState, useEffect } from "react";
import { Layout, Typography, List, message } from "antd";
import { getHeaders } from "../../utils/apiConfig";
import ChallengeCard from "./ChallengeCard";
import "../../styles/RecommendationPage.css";

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
    <Layout className="recommendation-page">
      <Content className="recommendation-content">
        <div className="challenge-section">
          <Title level={2} className="challenge-section-title">
            Your Active Challenges
          </Title>
          <div className="challenge-list">
            {activeChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onComplete={handleChallengeComplete}
              />
            ))}
          </div>
        </div>

        <div className="challenge-section">
          <Title level={2} className="challenge-section-title">
            Completed Challenges
          </Title>
          <div className="challenge-list">
            {completedChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                completed
              />
            ))}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default RecommendationPage;
