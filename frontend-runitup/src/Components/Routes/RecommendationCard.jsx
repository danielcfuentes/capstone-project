import React from "react";
import { Card, Typography, Button, Tooltip } from "antd";
import {
  CompassOutlined,
  RiseOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const RecommendationCard = ({ recommendation }) => {
  const { type, distance, elevationGain, terrain, estimatedPace, description } =
    recommendation;

  const getTypeIcon = () => {
    switch (type) {
      case "similar":
        return <CompassOutlined />;
      case "challenge":
        return <RiseOutlined />;
      case "exploration":
        return <EnvironmentOutlined />;
      case "interval":
        return <DashboardOutlined />;
      case "recovery":
        return <DashboardOutlined style={{ color: "green" }} />;
      default:
        return <CompassOutlined />;
    }
  };

  return (
    <Card
      title={
        <span>
          {getTypeIcon()} {type.charAt(0).toUpperCase() + type.slice(1)} Route
        </span>
      }
      extra={
        <Tooltip title="Use this route">
          <Button type="primary" size="small">
            Select
          </Button>
        </Tooltip>
      }
    >
      <Paragraph>{description}</Paragraph>
      <Text strong>Distance:</Text> <Text>{distance.toFixed(2)} miles</Text>
      <br />
      <Text strong>Elevation Gain:</Text>{" "}
      <Text>{elevationGain ? `${elevationGain.toFixed(0)} ft` : "N/A"}</Text>
      <br />
      <Text strong>Terrain:</Text> <Text>{terrain}</Text>
      <br />
      <Text strong>Estimated Pace:</Text>{" "}
      <Text>{estimatedPace.toFixed(2)} min/mile</Text>
    </Card>
  );
};

export default RecommendationCard;
