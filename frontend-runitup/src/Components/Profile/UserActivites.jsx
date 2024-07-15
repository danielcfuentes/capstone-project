import React, { useState, useEffect } from "react";
import { List, Card, Typography, Spin } from "antd";
import { getHeaders } from "../../utils/apiConfig";

const { Title, Text } = Typography;

const UserActivities = () => {
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
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Spin spinning={loading}>
      <Title level={3}>Recent Activities</Title>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={activities}
        renderItem={(activity) => (
          <List.Item>
            <Card
              title={`${activity.activityType} on ${new Date(
                activity.startDateTime
              ).toLocaleDateString()}`}
            >
              <p>
                <Text strong>Duration:</Text>{" "}
                {formatDuration(activity.duration)}
              </p>
              <p>
                <Text strong>Distance:</Text> {activity.distance.toFixed(2)}{" "}
                miles
              </p>
              <p>
                <Text strong>Average Pace:</Text>{" "}
                {activity.averagePace.toFixed(2)} min/mile
              </p>
              <p>
                <Text strong>Calories Burned:</Text> {activity.caloriesBurned}
              </p>
              <p>
                <Text strong>Elevation Gain:</Text>{" "}
                {activity.elevationGain?.toFixed(2)} ft
              </p>
              <p>
                <Text strong>Elevation Loss:</Text>{" "}
                {activity.elevationLoss?.toFixed(2)} ft
              </p>
              <p>
                <Text strong>Start Coordinates:</Text>{" "}
                {activity.startLatitude.toFixed(4)},{" "}
                {activity.startLongitude.toFixed(4)}
              </p>
              <p>
                <Text strong>End Coordinates:</Text>{" "}
                {activity.endLatitude.toFixed(4)},{" "}
                {activity.endLongitude.toFixed(4)}
              </p>
            </Card>
          </List.Item>
        )}
      />
    </Spin>
  );
};

export default UserActivities;
