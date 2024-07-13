import React from "react";
import { Card, Descriptions, Typography, List, Progress, Spin } from "antd";
import {
  EnvironmentOutlined,
  CompassOutlined,
  FieldTimeOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const RouteInfo = ({ routeData, isLoadingTerrain }) => {
  if (!routeData) return null;

  const { distance, duration, elevationData, terrain, directions } = routeData;

  const renderTerrain = () => {
    if (isLoadingTerrain) {
      return <Spin tip="Loading terrain information..." />;
    }

    if (!terrain) return null;

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
              strokeColor={terrainColors[type] || "#8c8c8c"}
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
          {distance ? `${distance} miles` : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <FieldTimeOutlined /> Estimated Duration Based On Your Profile
            </>
          }
        >
          {duration || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <RiseOutlined /> Elevation Gain
            </>
          }
        >
          {elevationData?.gain ? `${elevationData.gain} ft` : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <RiseOutlined /> Elevation Loss
            </>
          }
        >
          {elevationData?.loss ? `${elevationData.loss} ft` : "N/A"}
        </Descriptions.Item>
      </Descriptions>
      <Title level={5}>
        <CompassOutlined /> Terrain Breakdown
      </Title>
      {renderTerrain()}
    </Card>
  );
};

export default RouteInfo;
