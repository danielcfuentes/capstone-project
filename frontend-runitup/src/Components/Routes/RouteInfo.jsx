import React from "react";
import { Card, Descriptions, Typography, List } from "antd";
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
              <FieldTimeOutlined /> Estimated Duration Based On Your Profile
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
      {/* <Title level={5}>Turn-by-Turn Directions</Title>
      <List
        dataSource={directions}
        renderItem={(item, index) => (
          <List.Item>
            <Typography.Text strong>{index + 1}. </Typography.Text>{" "}
            {item.instruction} ({item.distance} miles)
          </List.Item>
        )}
      /> */}
    </Card>
  );
};

export default RouteInfo;
