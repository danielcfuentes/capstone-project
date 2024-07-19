import React, { useState, useEffect } from "react";
import { Table, Typography, Layout, Spin, Card, Row, Col, Avatar } from "antd";
import { TrophyOutlined, CrownOutlined, UserOutlined } from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";
import "../../styles/LeaderboardPage.css"

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
      render: (_, __, index) => {
        if (index + 1 === 1)
          return (
            <CrownOutlined style={{ color: "#FFD700", fontSize: "24px" }} />
          );
        if (index + 1 === 2)
          return (
            <CrownOutlined style={{ color: "#C0C0C0", fontSize: "22px" }} />
          );
        if (index + 1 === 3)
          return (
            <CrownOutlined style={{ color: "#CD7F32", fontSize: "20px" }} />
          );
        return index + 1;
      },
    },
    {
      title: "User",
      dataIndex: "username",
      key: "username",
      render: (username) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar
            style={{
              backgroundColor: generateColor(username),
              marginRight: "8px",
            }}
          >
            {username.charAt(0).toUpperCase()}
          </Avatar>
          {username}
        </div>
      ),
    },
    {
      title: "Completed Challenges",
      dataIndex: "completedChallenges",
      key: "completedChallenges",
      render: (completedChallenges) => (
        <span>
          {completedChallenges} <TrophyOutlined style={{ color: "#FFD700" }} />
        </span>
      ),
    },
  ];

  return (
    <Layout className="leaderboard-page">
      <Content className="leaderboard-content">
        <Title level={2} className="leaderboard-title">
          <TrophyOutlined /> Leaderboard
        </Title>
        <Card className="leaderboard-card">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row gutter={[16, 16]} className="top-three">
                {leaderboardData.slice(0, 3).map((user, index) => (
                  <Col xs={24} sm={8} key={user.username}>
                    <Card className={`top-three-card rank-${index + 1}`}>
                      <Avatar
                        size={64}
                        style={{
                          backgroundColor: generateColor(user.username),
                        }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Title level={4}>{user.username}</Title>
                      <p>{user.completedChallenges} challenges</p>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Table
                dataSource={leaderboardData.slice(3)}
                columns={columns}
                rowKey="username"
                pagination={false}
                className="leaderboard-table"
              />
            </>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default LeaderboardPage;
