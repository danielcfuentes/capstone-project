import React, { useState } from "react";
import { Form, Input, Button, Select, Card, Typography, message } from "antd";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/RecommendationPage.css"

const { Title, Text } = Typography;
const { Option } = Select;

const RecommendationPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState(null);

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

      console.log(JSON.stringify(values));

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

  return (
    <div className="recommendation-page">
      <Title level={2}>Get Your Personalized Running Plan</Title>
      <Form form={form} onFinish={onFinish} layout="vertical">
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
          <Button type="primary" htmlType="submit" loading={loading}>
            Get Recommendation
          </Button>
        </Form.Item>
      </Form>

      {recommendedPlan && (
        <Card title="Recommended Plan" className="recommended-plan-card">
          <Title level={3}>{recommendedPlan.name}</Title>
          <Text>{recommendedPlan.description}</Text>
          <Text strong>Distance: {recommendedPlan.distance}</Text>
          <Text strong>Duration: {recommendedPlan.duration} weeks</Text>
          <Text strong>Level: {recommendedPlan.level}</Text>
          {/* Add more details as needed */}
        </Card>
      )}
    </div>
  );
};

export default RecommendationPage;
