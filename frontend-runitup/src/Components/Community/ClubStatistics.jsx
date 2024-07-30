// ClubStatistics.jsx
import React, { useState, useEffect } from "react";
import { Card, Statistic, Row, Col, Spin, message } from "antd";
import {
  DashboardOutlined,
  FireOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";

const ClubStatistics = ({ clubId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/statistics`,
          { headers: getHeaders() }
        );
        if (!response.ok) throw new Error("Failed to fetch statistics");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        message.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [clubId]);

  if (loading) return <Spin size="large" />;
  if (!stats) return <div>No statistics available</div>;

  return (
    <Card title="Club Statistics">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Total Distance"
            value={stats.totalDistance}
            suffix="km"
            prefix={<DashboardOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Average Pace"
            value={stats.averagePace}
            suffix="min/km"
            prefix={<FieldTimeOutlined />}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Total Activities"
            value={stats.totalActivities}
            prefix={<FireOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default ClubStatistics;
