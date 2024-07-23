import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  List,
  Card,
  Tag,
  Spin,
  message,
  Col,
  Row,
  Statistic,
  Select,
  Pagination
} from "antd";
import {
  TrophyOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  FireOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/UserActivitiesPage.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const UserActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Number of items per page

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

  const SummarySection = ({ activities }) => {
    const totalDistance = activities.reduce(
      (sum, activity) => sum + activity.distance,
      0
    );
    const totalCalories = activities.reduce(
      (sum, activity) => sum + activity.caloriesBurned,
      0
    );
    const totalActivities = activities.length;

    return (
      <Card className="summary-section">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Total Distance"
              value={totalDistance.toFixed(2)}
              suffix="miles"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Total Calories Burned"
              value={totalCalories}
              suffix="cal"
            />
          </Col>
          <Col span={8}>
            <Statistic title="Total Activities" value={totalActivities} />
          </Col>
        </Row>
      </Card>
    );
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    const sortedActivities = [...activities].sort((a, b) => {
      if (value === "date")
        return new Date(b.startDateTime) - new Date(a.startDateTime);
      if (value === "distance") return b.distance - a.distance;
      if (value === "calories") return b.caloriesBurned - a.caloriesBurned;
      return 0;
    });
    setActivities(sortedActivities);
  };

  const paginatedActivities = activities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  return (
    <Layout className="user-activities-page">
      <Content className="user-activities-content">
        <Title level={2} className="page-title">
          Your Running Activities
        </Title>
        <SummarySection activities={activities} />
        <Spin spinning={loading}>
          <Select
            defaultValue="date"
            style={{ width: 120, marginBottom: 16 }}
            onChange={handleSortChange}
          >
            <Option value="date">Date</Option>
            <Option value="distance">Distance</Option>
            <Option value="calories">Calories</Option>
          </Select>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
            dataSource={paginatedActivities}
            renderItem={(activity) => (
              <List.Item>
                <Card
                  className="activity-card"
                  title={
                    <div className="activity-card-title">
                      <TrophyOutlined /> {activity.activityType}
                    </div>
                  }
                  extra={
                    <Tag color="blue">{formatDate(activity.startDateTime)}</Tag>
                  }
                >
                  <div className="activity-details">
                    <Text>
                      <EnvironmentOutlined /> Start:{" "}
                      {activity.startLocation || "N/A"}
                    </Text>
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
          <Pagination
            current={currentPage}
            onChange={setCurrentPage}
            total={activities.length}
            pageSize={pageSize}
            style={{ marginTop: 16, textAlign: "center" }}
          />
        </Spin>
      </Content>
    </Layout>
  );
};

export default UserActivitiesPage;
