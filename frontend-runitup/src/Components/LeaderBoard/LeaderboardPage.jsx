import React, { useState, useEffect } from "react";
import { Table, Typography, Layout, Spin } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";

const { Title } = Typography;
const { Content } = Layout;

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/leaderboard`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }
      const data = await response.json();
      setLeaderboardData(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Rank",
      key: "rank",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Completed Challenges",
      dataIndex: "completedChallenges",
      key: "completedChallenges",
    },
  ];

  return (
    <Layout className="leaderboard-page">
      <Content className="leaderboard-content">
        <Title level={2}>
          <TrophyOutlined /> Leaderboard
        </Title>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Table
            dataSource={leaderboardData}
            columns={columns}
            rowKey="username"
            pagination={false}
          />
        )}
      </Content>
    </Layout>
  );
};

export default LeaderboardPage;
