import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Typography,
  message,
  List,
  Modal,
  Spin,
  Tag,
} from "antd";
import {
  ClockCircleOutlined,
  AimOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/RecommendationPage.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const RecommendationPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/api/all-plans`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      setAllPlans(data.plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      message.error("Failed to fetch plans. Please try again.");
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/api/recommend-plan`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recommendation");
      }

      const data = await response.json();
      setRecommendedPlan(data.recommendedPlan);
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      message.error("Failed to get recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setModalVisible(true);
  };

  const renderPlanCard = (plan) => (
    <Card
      hoverable
      className="plan-card"
      cover={
        <div className="plan-card-cover">
          <Title level={4}>{plan.name}</Title>
          <Tag color="blue">{plan.level}</Tag>
        </div>
      }
      actions={[
        <Button type="link" onClick={() => showPlanDetails(plan)}>
          View Details
        </Button>,
      ]}
    >
      <div className="plan-card-content">
        <Text>
          <AimOutlined /> Distance: {plan.distance}
        </Text>
        <Text>
          <ClockCircleOutlined /> Duration: {plan.duration} weeks
        </Text>
        <Text>
          <TrophyOutlined /> Goal: {plan.goalTime}
        </Text>
      </div>
    </Card>
  );

  return (
    <div className="recommendation-page">
      <div className="recommendation-header">
        <Title level={2}>Personalized Running Plan</Title>
        <Paragraph>
          Get a tailored running plan based on your goals and preferences.
        </Paragraph>
      </div>

      <Card className="recommendation-form-card">
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className="recommendation-form"
        >
          <Form.Item
            name="preferredDistance"
            label="Preferred Race Distance"
            rules={[
              {
                required: true,
                message: "Please select your preferred race distance",
              },
            ]}
          >
            <Select placeholder="Select distance">
              <Option value="5K">5K</Option>
              <Option value="10K">10K</Option>
              <Option value="Half Marathon">Half Marathon</Option>
              <Option value="Marathon">Marathon</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="goalTime"
            label="Goal Time (HH:MM:SS)"
            rules={[
              { required: true, message: "Please enter your goal time" },
              {
                pattern: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/,
                message: "Please enter a valid time in HH:MM:SS format",
              },
            ]}
          >
            <Input placeholder="e.g., 01:30:00" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Get Recommendation
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {recommendedPlan && (
        <div className="recommended-plan-section">
          <Title level={3}>Recommended Plan</Title>
          {renderPlanCard(recommendedPlan)}
        </div>
      )}

      <div className="all-plans-section">
        <Title level={3}>All Available Plans</Title>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
          dataSource={allPlans}
          renderItem={renderPlanCard}
        />
      </div>

      <Modal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        className="plan-modal"
        width={800}
      >
        {selectedPlan && (
          <div className="plan-modal-content">
            <div className="plan-modal-header">
              <Title level={2}>{selectedPlan.name}</Title>
              <Tag color="blue" className="plan-level-tag">
                {selectedPlan.level}
              </Tag>
            </div>
            <Paragraph>{selectedPlan.description}</Paragraph>
            <div className="plan-details">
              <Text strong>
                <AimOutlined /> Distance:{" "}
              </Text>
              <Text>{selectedPlan.distance}</Text>
              <Text strong>
                <ClockCircleOutlined /> Duration:{" "}
              </Text>
              <Text>{selectedPlan.duration} weeks</Text>
              <Text strong>
                <TrophyOutlined /> Goal Time:{" "}
              </Text>
              <Text>{selectedPlan.goalTime}</Text>
            </div>
            <Title level={4}>Weekly Schedule</Title>
            {selectedPlan.weeklySchedule.map((week, index) => (
              <Card
                key={index}
                className="week-card"
                title={`Week ${week.week}`}
              >
                <ul className="day-list">
                  {week.days.map((day, dayIndex) => (
                    <li key={dayIndex}>
                      <strong>{day.day}:</strong> {day.workout}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
            <Title level={4}>Tips</Title>
            <ul className="tips-list">
              {selectedPlan.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecommendationPage;
