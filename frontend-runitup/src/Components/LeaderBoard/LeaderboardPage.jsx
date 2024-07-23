import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Layout,
  Spin,
  Card,
  Avatar,
  Tooltip,
  Tag,
  Pagination,
} from "antd";
import {
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";
import "../../styles/LeaderboardPage.css";

const { Title } = Typography;
const { Content } = Layout;

const LeaderboardPage = ({ currentUser }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

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
      render: (rank, record) => (
        <span
          className={
            record.username === currentUser?.name ? "current-user-rank" : ""
          }
        >
          {rank}
        </span>
      ),
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
          <span
            className={
              record.username === currentUser?.name ? "current-user-name" : ""
            }
          >
            {username}
          </span>
          {record.username === currentUser?.name && (
            <Tag color="blue" style={{ marginLeft: "8px" }}>
              You
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Completed Challenges",
      dataIndex: "completedChallenges",
      key: "completedChallenges",
      render: (completedChallenges, record) => (
        <Tooltip title={`Total Distance: ${record.totalDistance} miles`}>
          <span
            className={
              record.username === currentUser?.name
                ? "current-user-challenges"
                : ""
            }
          >
            {completedChallenges}{" "}
            <TrophyOutlined style={{ color: "#FFD700" }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Trend",
      dataIndex: "trend",
      key: "trend",
      render: (trend) => (
        <span>
          {trend > 0 ? (
            <ArrowUpOutlined style={{ color: "green" }} />
          ) : trend < 0 ? (
            <ArrowDownOutlined style={{ color: "red" }} />
          ) : (
            "-"
          )}
        </span>
      ),
    },
  ];

  const paginatedData = leaderboardData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
              <Table
                dataSource={paginatedData}
                columns={columns}
                rowKey="username"
                pagination={false}
                className="leaderboard-table"
                rowClassName={(record, index) =>
                  (index % 10 === 9 ? "tenth-row " : "") +
                  (record.username === currentUser?.name
                    ? "current-user-row"
                    : "")
                }
              />
              <Pagination
                current={currentPage}
                total={leaderboardData.length}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                className="leaderboard-pagination"
              />
            </>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default LeaderboardPage;
