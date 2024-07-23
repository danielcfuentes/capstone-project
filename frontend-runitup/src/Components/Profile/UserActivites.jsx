import React, { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  List,
  Card,
  Tag,
  Spin,
  message,
  Select,
  Pagination,
  Button,
  Modal,
  Checkbox,
  Row,
  Col,
  Statistic,
  Table,
} from "antd";
import {
  TrophyOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  FireOutlined,
  EnvironmentOutlined,
  CloudOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../../styles/UserActivitiesPage.css";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const UserActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [isCompareModalVisible, setIsCompareModalVisible] = useState(false);
  const [originalActivities, setOriginalActivities] = useState([]);
  const pageSize = 9;

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
      setOriginalActivities(data); // Store the original order
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

  const toggleActivitySelection = (activity) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activity)) {
        return prev.filter((a) => a !== activity);
      } else {
        // Add the new activity and sort based on the original order
        const newSelection = [...prev, activity];
        return newSelection.sort(
          (a, b) =>
            originalActivities.indexOf(a) - originalActivities.indexOf(b)
        );
      }
    });
  };

  const clearSelection = () => {
    setSelectedActivities([]);
  };

  const filteredActivities =
    selectedActivities.length > 0 ? selectedActivities : activities;

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
        <Row gutter={16} justify="center">
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

  const ProgressChart = ({ activities }) => {
    const chartData = (
      selectedActivities.length > 0 ? selectedActivities : activities
    ).map((activity) => ({
      date: formatDate(activity.startDateTime),
      distance: activity.distance,
    }));

    return (
      <Card className="progress-chart-card">
        <Title level={4}>Running Progress</Title>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              label={{
                value: "Distance (miles)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="distance"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  const WeatherInfo = ({ weather }) => {
    if (!weather) return null;
    try {
      const weatherData = JSON.parse(weather);
      return (
        <Text>
          <CloudOutlined className="detail-icon" /> Weather:{" "}
          {Math.round(weatherData.temperature)}°F, {weatherData.condition}
        </Text>
      );
    } catch (error) {
      console.error("Error parsing weather data:", error);
      return null;
    }
  };

  const CompareActivities = ({ activities }) => {
    const columns = [
      {
        title: "Date",
        dataIndex: "startDateTime",
        render: (date) => formatDate(date),
      },
      {
        title: "Distance",
        dataIndex: "distance",
        render: (dist) => `${dist.toFixed(2)} miles`,
      },
      {
        title: "Duration",
        dataIndex: "duration",
        render: (dur) => formatDuration(dur),
      },
      {
        title: "Calories Burned",
        dataIndex: "caloriesBurned",
      },
      {
        title: "Elevation Gain",
        dataIndex: "elevationGain",
      },
    ];

    return (
      <Table columns={columns} dataSource={activities} pagination={false} />
    );
  };

  const paginatedActivities = activities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <Layout className="user-activities-page">
      <Content className="user-activities-content">
        <Title level={2} className="page-title">
          My Activities
        </Title>
        <SummarySection activities={activities} />
        <ProgressChart activities={activities} />
        <div className="controls-row">
          <Select
            defaultValue="date"
            onChange={handleSortChange}
            className="sort-select"
          >
            <Option value="date">Sort by Date</Option>
            <Option value="distance">Sort by Distance</Option>
            <Option value="calories">Sort by Calories</Option>
          </Select>
          <Button
            type="primary"
            className="compare-button"
            onClick={() => setIsCompareModalVisible(true)}
            disabled={selectedActivities.length < 2}
          >
            Compare Selected
          </Button>
          <Button
            onClick={clearSelection}
            disabled={selectedActivities.length === 0}
            className="clear-selection-button"
          >
            Clear Selection
          </Button>
        </div>
        <Spin spinning={loading}>
          <List
            grid={{ gutter: 16, column: 3 }}
            dataSource={paginatedActivities}
            renderItem={(activity) => (
              <List.Item>
                <Card className="activity-card">
                  <div className="activity-card-header">
                    <Checkbox
                      checked={selectedActivities.includes(activity)}
                      onChange={() => toggleActivitySelection(activity)}
                      className="activity-checkbox"
                    />
                    <div className="activity-card-title">
                      <TrophyOutlined className="activity-icon" />{" "}
                      {activity.activityType}
                    </div>
                    <Tag color="blue" className="activity-date-tag">
                      {formatDate(activity.startDateTime)}
                    </Tag>
                  </div>
                  <div className="activity-details">
                    <Text>
                      <EnvironmentOutlined className="detail-icon" /> Start
                      Location: {activity.startLocation || "N/A"}
                    </Text>
                    <Text>
                      <FieldTimeOutlined className="detail-icon" /> Duration:{" "}
                      {formatDuration(activity.duration)}
                    </Text>
                    <Text>
                      <FireOutlined className="detail-icon" /> Calories Burned:{" "}
                      {activity.caloriesBurned}
                    </Text>
                    <Text>
                      <RiseOutlined className="detail-icon" /> Elevation Gain:{" "}
                      {activity.elevationGain || "N/A"} ft
                    </Text>
                    <Text>
                      <CalendarOutlined className="detail-icon" /> Distance:{" "}
                      {activity.distance.toFixed(2)} miles
                    </Text>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Spin>
        <Pagination
          current={currentPage}
          onChange={setCurrentPage}
          total={activities.length}
          pageSize={pageSize}
          className="activities-pagination"
        />
        <Modal
          title="Compare Activities"
          visible={isCompareModalVisible}
          onCancel={() => setIsCompareModalVisible(false)}
          footer={null}
          width={800}
        >
          <CompareActivities activities={selectedActivities} />
        </Modal>
      </Content>
    </Layout>
  );
};

export default UserActivitiesPage;
