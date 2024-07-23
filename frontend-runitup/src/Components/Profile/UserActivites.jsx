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
  Table
} from "antd";
import {
  TrophyOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
  FireOutlined,
  EnvironmentOutlined,
  CloudOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";
import { Line } from "@ant-design/plots";
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
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
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

  const ProgressChart = ({ activities }) => {
    const chartData = activities
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
      .map((activity) => ({
        date: formatDate(activity.startDateTime),
        distance: activity.distance,
      }));

    const config = {
      data: chartData,
      xField: "date",
      yField: "distance",
      xAxis: {
        type: "timeCat",
        label: {
          formatter: (v) => `${v.split(",")[0]} ${v.split(",")[1]}`,
          rotate: 45,
        },
      },
      yAxis: {
        label: {
          formatter: (v) => `${v} miles`,
        },
      },
      smooth: true,
    };

    return <Line {...config} />;
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
      { title: "Calories", dataIndex: "caloriesBurned" },
      {
        title: "Weather",
        dataIndex: "weather",
        render: (weather) => `${weather?.temperature}°F, ${weather?.condition}`,
      },
    ];

    return (
      <Table
        dataSource={activities}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
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
          Your Running Activities
        </Title>
        <SummarySection activities={activities} />
        <ProgressChart activities={activities} />
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Select
              defaultValue="date"
              style={{ width: 120 }}
              onChange={handleSortChange}
            >
              <Option value="date">Date</Option>
              <Option value="distance">Distance</Option>
              <Option value="calories">Calories</Option>
            </Select>
          </Col>
          <Col>
            <Button
              onClick={() => setIsCompareModalVisible(true)}
              disabled={selectedActivities.length < 2}
            >
              Compare Selected Activities
            </Button>
          </Col>
        </Row>
        <Spin spinning={loading}>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
            dataSource={paginatedActivities}
            renderItem={(activity) => (
              <List.Item>
                <Card
                  className="activity-card"
                  title={
                    <div className="activity-card-title">
                      <Checkbox
                        checked={selectedActivities.includes(activity)}
                        onChange={() => toggleActivitySelection(activity)}
                      />
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
                    <Text>
                      <CloudOutlined /> Weather: {activity.weather?.temperature}
                      °F, {activity.weather?.condition}
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
          style={{ marginTop: 16, textAlign: "center" }}
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
