import React, { useState, useEffect } from "react";
import { Layout, Typography, List, Card, Tag, Spin, message } from "antd";
import {
  RunningOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";
import "./UserActivitiesPage.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const UserActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/user-activities`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
      setActivities(data);
      setLoading(false);
    } catch (error) {
      message.error(`Error fetching activities: ${error.message}`);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Layout className="user-activities-page">
      <Content className="user-activities-content">
        <Title level={2} className="page-title">
          Your Running Activities
        </Title>
        <Spin spinning={loading}>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
            dataSource={activities}
            renderItem={(activity) => (
              <List.Item>
                <Card
                  className="activity-card"
                  title={
                    <div className="activity-card-title">
                      <RunningOutlined /> {activity.activityType}
                    </div>
                  }
                  extra={
                    <Tag color="blue">{formatDate(activity.startDateTime)}</Tag>
                  }
                >
                  <div className="activity-details">
                    <Text>
                      <CalendarOutlined /> Distance:{" "}
                      {activity.distance.toFixed(2)} miles
                    </Text>
                    <Text>
                      <FieldTimeOutlined /> Duration:{" "}
                      {formatDuration(activity.duration)}
                    </Text>
                    <Text>
                      <FireOutlined /> Calories: {activity.caloriesBurned}
                    </Text>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Spin>
      </Content>
    </Layout>
  );
};

export default UserActivitiesPage;
