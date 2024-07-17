import React, { useState, useEffect } from "react";
import { Layout, Typography, Tabs, message, Spin, Empty } from "antd";
import { getHeaders } from "../../utils/apiConfig";
import ChallengeCard from "./ChallengeCard";
import PastChallenges from "./PastChallenges";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const RecommendationPage = () => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [pastChallenges, setPastChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeUntilNextChallenge, setTimeUntilNextChallenge] = useState("");

  useEffect(() => {
    fetchChallenges();
    const intervalId = setInterval(fetchChallenges, 300000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      const timeLeft = tomorrow - now;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setTimeUntilNextChallenge(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/challenges`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch challenges");
      const data = await response.json();
      setActiveChallenges(
        data.filter((challenge) => challenge.status === "active")
      );
      setPastChallenges(
        data.filter(
          (challenge) =>
            challenge.status === "completed" || challenge.status === "failed"
        )
      );
    } catch (error) {
      message.error("Failed to fetch challenges");
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeUpdate = async (challengeId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/challenges/${challengeId}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error("Failed to update challenge");
      message.success("Challenge updated successfully");
      fetchChallenges();
    } catch (error) {
      message.error("Failed to update challenge");
    }
  };

  const renderChallenges = () => {
    if (loading) return <Spin size="large" />;
    if (activeChallenges.length === 0) {
      return (
        <Empty
          description={
            <span>
              No current challenges. <br />
              Next challenges in: {timeUntilNextChallenge}
            </span>
          }
        />
      );
    }

    return activeChallenges.map((challenge) => (
      <ChallengeCard
        key={challenge.id}
        challenge={challenge}
        onUpdate={handleChallengeUpdate}
      />
    ));
  };

  return (
    <Layout style={{ padding: "50px 0 0 0" }}>
      <Content style={{ padding: "50px" }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Current Challenges" key="1">
            {renderChallenges()}
          </TabPane>
          <TabPane tab="Past Challenges" key="2">
            <PastChallenges challenges={pastChallenges} />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default RecommendationPage;
