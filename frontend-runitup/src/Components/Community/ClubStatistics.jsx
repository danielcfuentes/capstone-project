import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import {
  DashboardOutlined,
  FireOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";

const ClubStatistics = ({ club }) => {
  if (!club || !club.stats) return <div>Loading statistics...</div>;

  const { stats } = club;

  return (
    <Card title="Club Statistics" className="club-statistics">
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
