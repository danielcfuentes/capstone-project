import React, { useState, useEffect } from "react";
import { Table, Typography, Layout, Spin, Card, Row, Col, Avatar } from "antd";
import { TrophyOutlined, CrownOutlined, UserOutlined } from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";
import "../../styles/LeaderboardPage.css";

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
      render: (_, __, index) => index + 4,
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

  const renderCrownedAvatar = (username, rank) => {
    const crownStyle = {
      position: "absolute",
      top: "-12px",
      right: "-12px",
      fontSize: "32px",
      filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.5))",
    };
    let crown;
    switch (rank) {
      case 1:
        crown = <CrownOutlined style={{ ...crownStyle, color: "#FFD700" }} />;
        break;
      case 2:
        crown = <CrownOutlined style={{ ...crownStyle, color: "#C0C0C0" }} />;
        break;
      case 3:
        crown = <CrownOutlined style={{ ...crownStyle, color: "#CD7F32" }} />;
        break;
      default:
        crown = null;
    }

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <Avatar size={80} style={{ backgroundColor: generateColor(username) }}>
          {username.charAt(0).toUpperCase()}
        </Avatar>
        {crown}
      </div>
    );
  };

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
                      {renderCrownedAvatar(user.username, index + 1)}
                      <div className="username-container">
                        <Title level={4}>{user.username}</Title>
                      </div>
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
