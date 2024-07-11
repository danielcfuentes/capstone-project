// src/components/RecommendationForm.jsx
import React from "react";
import { Form, Input, Button, Select } from "antd";

const { Option } = Select;

const RecommendationForm = ({ onFinish, loading }) => {
  const [form] = Form.useForm();

  return (
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
        <Button type="primary" htmlType="submit" loading={loading}>
          Get Recommendation
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RecommendationForm;
