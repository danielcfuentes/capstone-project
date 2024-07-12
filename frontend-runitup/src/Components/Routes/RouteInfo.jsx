import React from "react";
import { Card, Descriptions, Typography, List, Progress } from "antd";
import {
  EnvironmentOutlined,
  CompassOutlined,
  FieldTimeOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const RouteInfo = ({ routeData }) => {
  if (!routeData) return null;

  const {
    distance,
    duration,
    elevationGain,
    elevationLoss,
    terrain,
    directions,
  } = routeData;

  const renderTerrain = () => {
    const terrainColors = {
      "Paved Road": "#1890ff",
      "Urban Path": "#722ed1",
      "Gravel/Dirt Path": "#faad14",
      "Nature Trail": "#52c41a",
      "Mixed Terrain": "#8c8c8c",
    };

    return (
      <div>
        {Object.entries(terrain).map(([type, percentage]) => (
          <div key={type} style={{ marginBottom: "10px" }}>
            <span>
              {type}: {percentage}%
            </span>
            <Progress
              percent={parseFloat(percentage)}
              strokeColor={terrainColors[type]}
              size="small"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="route-info-card">
      <Title level={4}>Route Information</Title>
      <Descriptions column={2}>
        <Descriptions.Item
          label={
            <>
              <EnvironmentOutlined /> Distance
            </>
          }
        >
          {distance} miles
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <FieldTimeOutlined /> Estimated Duration
            </>
          }
        >
          {duration}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <RiseOutlined /> Elevation Gain
            </>
          }
        >
          {elevationGain} ft
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <RiseOutlined /> Elevation Loss
            </>
          }
        >
          {elevationLoss} ft
        </Descriptions.Item>
      </Descriptions>
      <Title level={5}>
        <CompassOutlined /> Terrain Breakdown
      </Title>
      {renderTerrain()}
      <Title level={5}>Turn-by-Turn Directions</Title>
      <List
        dataSource={directions}
        renderItem={(item, index) => (
          <List.Item>
            <Typography.Text strong>{index + 1}. </Typography.Text>{" "}
            {item.instruction} ({item.distance} miles)
          </List.Item>
        )}
      />
    </Card>
  );
};

export default RouteInfo;
