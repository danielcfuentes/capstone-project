import React from "react";
import { Card, Descriptions, Typography } from "antd";
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
        <Descriptions.Item
          label={
            <>
              <CompassOutlined /> Terrain
            </>
          }
        >
          {terrain}
        </Descriptions.Item>
      </Descriptions>
      <Title level={5}>Turn-by-Turn Directions</Title>
      <ol>
        {directions.map((direction, index) => (
          <li key={index}>{direction}</li>
        ))}
      </ol>
    </Card>
  );
};

export default RouteInfo;
