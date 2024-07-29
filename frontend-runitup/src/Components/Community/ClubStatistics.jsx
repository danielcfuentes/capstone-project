import React, { useState, useEffect } from "react";
import { Card, Statistic, Row, Col } from "antd";
import { getHeaders } from "../../utils/apiConfig";

const ClubStatistics = ({ clubId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [clubId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/statistics`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch statistics");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  if (!stats) return <div>Loading statistics...</div>;

  return (
    <Card title="Club Statistics">
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Total Distance"
            value={stats.totalDistance}
            suffix="km"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Average Pace"
            value={stats.averagePace}
            suffix="min/km"
          />
        </Col>
        <Col span={8}>
          <Statistic title="Total Activities" value={stats.totalActivities} />
        </Col>
      </Row>
    </Card>
  );
};

export default ClubStatistics;
