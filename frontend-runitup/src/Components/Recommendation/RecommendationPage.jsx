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
    fetchPastChallenges();
    const intervalId = setInterval(fetchChallenges, 60000); // Refresh every minute
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
      setActiveChallenges(activeChallenges);

      if (activeChallenges.length === 0) {
        // Set next challenge time to the start of the next hour
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1);
        nextHour.setMinutes(0);
        nextHour.setSeconds(0);
        nextHour.setMilliseconds(0);
        setNextChallengeTime(nextHour);
      } else {
        setNextChallengeTime(null);
      }
    } catch (error) {
      console.error("Failed to fetch active challenges:", error);
      message.error("Failed to fetch active challenges");
    } finally {
      setLoading(false);
    }
  };

  const fetchPastChallenges = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/past-challenges`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch past challenges");
      const data = await response.json();
      setPastChallenges(data);
    } catch (error) {
      console.error("Failed to fetch past challenges:", error);
      message.error("Failed to fetch past challenges");
      setPastChallenges([]); // Set to empty array on error
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
      fetchPastChallenges();
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
