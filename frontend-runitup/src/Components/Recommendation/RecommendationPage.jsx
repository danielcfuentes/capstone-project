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
  const [nextChallengeTime, setNextChallengeTime] = useState(null);

  useEffect(() => {
    fetchChallenges();
    const intervalId = setInterval(fetchChallenges, 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let timerId;
    if (nextChallengeTime) {
      timerId = setInterval(() => {
        const now = new Date();
        if (now >= nextChallengeTime) {
          fetchChallenges();
          clearInterval(timerId);
        }
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [nextChallengeTime]);

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
      const activeChallenges = data.filter(
        (challenge) => challenge.status === "active"
      );
      const pastChallenges = data.filter(
        (challenge) =>
          challenge.status === "completed" || challenge.status === "failed"
      );
      setActiveChallenges(activeChallenges);
      setPastChallenges(pastChallenges);

      if (activeChallenges.length === 0) {
        // Set next challenge time to 1 minute from now
        const nextMinute = new Date(Date.now() + 60000);
        setNextChallengeTime(nextMinute);
      } else {
        setNextChallengeTime(null);
      }
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
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
      console.error("Failed to update challenge:", error);
      message.error("Failed to update challenge");
    }
  };

  const renderChallenges = () => {
    if (loading) return <Spin size="large" />;
    if (activeChallenges.length === 0) {
      const timeUntilNext = nextChallengeTime
        ? Math.max(0, Math.floor((nextChallengeTime - new Date()) / 1000))
        : 0;
      const minutes = Math.floor(timeUntilNext / 60);
      const seconds = timeUntilNext % 60;
      return (
        <Empty
          description={
            <span>
              No current challenges. <br />
              Next challenges in: {minutes}m {seconds}s
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
