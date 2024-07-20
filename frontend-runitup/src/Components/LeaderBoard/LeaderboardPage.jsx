import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Layout,
  Spin,
  Card,
  Row,
  Col,
  Avatar,
  Tooltip,
  Tag,
} from "antd";
import { TrophyOutlined, CrownOutlined, UserOutlined } from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";
import "../../styles/LeaderboardPage.css";

const { Title, Text } = Typography;
const { Content } = Layout;

const LeaderboardPage = ({ currentUser }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
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
      console.log("Leaderboard data:", data);
      setLeaderboardData(data.leaderboard);
      setCurrentUserRank(data.currentUserRank);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
    },
    {
      title: "User",
      dataIndex: "username",
      key: "username",
      render: (username, record) => (
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
          {record.username === currentUser?.name && (
            <UserOutlined style={{ marginLeft: "8px", color: "#1890ff" }} />
          )}
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

  const renderCrownedAvatar = (username, rank, isCurrentUser) => {
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
        {isCurrentUser && (
          <UserOutlined
            style={{
              position: "absolute",
              bottom: "-5px",
              right: "-5px",
              fontSize: "24px",
              color: "#1890ff",
              backgroundColor: "white",
              borderRadius: "50%",
              padding: "2px",
              border: "2px solid #1890ff",
            }}
          />
        )}
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
                {leaderboardData.slice(0, 3).map((user) => (
                  <Col xs={24} sm={8} key={user.username}>
                    <Card
                      className={`top-three-card rank-${user.rank} ${
                        user.username === currentUser?.name
                          ? "current-user"
                          : ""
                      }`}
                    >
                      {renderCrownedAvatar(
                        user.username,
                        user.rank,
                        user.username === currentUser?.name
                      )}
                      <div className="username-container">
                        <Tooltip title={user.username}>
                          <Text ellipsis={true} className="username">
                            {user.username}
                          </Text>
                        </Tooltip>
                      </div>
                      <Text className="challenge-count">
                        {user.completedChallenges} challenges
                      </Text>
                      {user.username === currentUser?.name && (
                        <Tag color="blue" className="current-user-tag">
                          You
                        </Tag>
                      )}
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
                rowClassName={(record) =>
                  record.username === currentUser?.name
                    ? "current-user-row"
                    : ""
                }
              />
            </>
          )}
        </Card>
        {currentUserRank && currentUserRank > 10 && (
          <Card className="current-user-card">
            <Text>Your Rank: {currentUserRank}</Text>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default LeaderboardPage;
