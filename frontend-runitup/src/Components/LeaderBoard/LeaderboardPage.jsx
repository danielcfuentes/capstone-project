import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Layout,
  Spin,
  Card,
  Avatar,
  Tag,
  Pagination,
  Select,
  message,
} from "antd";
import {
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";
import "../../styles/LeaderboardPage.css";

const { Title } = Typography;
const { Content } = Layout;
const { Option } = Select;

const LeaderboardPage = ({ currentUser }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
      message.error("Error fetching leaderboard:", error);
      message.error("Error fetching leaderboard:", error);
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
          className={`rank-cell ${
            record.username === currentUser?.name ? "current-user-rank" : ""
          }`}
        >
          {rank <= 3 && <CrownOutlined className={`crown crown-${rank}`} />}
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
        <span
          className={
            record.username === currentUser?.name
              ? "current-user-challenges"
              : ""
          }
        >
          {completedChallenges} <TrophyOutlined style={{ color: "#FFD700" }} />
        </span>
      ),
    },
    {
      title: "Total Distance (miles)",
      dataIndex: "totalDistance",
      key: "totalDistance",
      render: (totalDistance) => parseFloat(totalDistance).toFixed(2),
    },
    {
      title: "Trend",
      dataIndex: "trend",
      key: "trend",
      render: (trend) => (
        <span>
          {trend > 0 ? (
            <>
              <ArrowUpOutlined style={{ color: "green" }} /> {trend}
            </>
          ) : trend < 0 ? (
            <>
              <ArrowDownOutlined style={{ color: "red" }} /> {Math.abs(trend)}
            </>
          ) : (
            "-"
          )}
        </span>
      ),
    },
  ];

  const renderUserRank = () => {
    console.log("Current user:", currentUser);
    console.log("Current user rank:", currentUserRank);
    console.log("Leaderboard data:", leaderboardData);

    const userInTop10 = leaderboardData.some(
      (user) => user.username === currentUser?.name
    );
    if (!userInTop10 && currentUser) {
      const userRankData = {
        rank: currentUserRank || "N/A",
        username: currentUser.name,
        completedChallenges: currentUser.completedChallenges || 0,
      };
      console.log("User rank data:", userRankData);
      return (
        <>
          <Divider />
          <Title level={4}>Your Rank</Title>
          <Table
            dataSource={[userRankData]}
            columns={columns}
            pagination={false}
            rowClassName="current-user-row"
          />
        </>
      );
    }
    return null;
  };

  return (
    <Layout className="leaderboard-page">
      <Content className="leaderboard-content">
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
                  `${index % 10 === 9 ? "tenth-row " : ""}${
                    record.username === currentUser?.name
                      ? "current-user-row"
                      : ""
                  }${record.rank <= 3 ? `top-${record.rank}` : ""}`
                }
              />
              <div className="pagination-container">
                <Pagination
                  current={currentPage}
                  total={leaderboardData.length}
                  pageSize={pageSize}
                  onChange={(page) => setCurrentPage(page)}
                  className="leaderboard-pagination"
                  showSizeChanger={false} // This hides the default select
                />
                <Select
                  value={pageSize}
                  onChange={(value) => {
                    setPageSize(value);
                    setCurrentPage(1);
                  }}
                  className="page-size-selector"
                >
                  <Option value={10}>10 / page</Option>
                  <Option value={20}>20 / page</Option>
                  <Option value={50}>50 / page</Option>
                  <Option value={100}>100 / page</Option>
                </Select>
              </div>
            </>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default LeaderboardPage;
