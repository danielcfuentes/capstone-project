import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Layout,
  message,
} from "antd";
import { getHeaders } from "../../utils/apiConfig";

const { Content } = Layout;
const { Option } = Select;

function ProfileSetupPage({ user, onProfileComplete }) {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/profile`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ ...values, isProfileComplete: true }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();

      message.success("Profile updated successfully");
      onProfileComplete();
    } catch (error) {
      message.error(`Error updating profile: ${error.message}`);
    }
  };

  return (
    <Layout className="profile-setup-page">
      <Content className="profile-setup-content">
        <h1>Welcome! Let's set up your profile</h1>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="age" label="Age" rules={[{ required: true }]}>
            <InputNumber min={1} max={120} />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Select>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="weight"
            label="Weight (kg)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={300} />
          </Form.Item>
          <Form.Item
            name="height"
            label="Height (cm)"
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={300} />
          </Form.Item>
          <Form.Item
            name="fitnessLevel"
            label="Fitness Level"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="runningExperience"
            label="Running Experience"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="novice">Novice</Option>
              <Option value="recreational">Recreational</Option>
              <Option value="competitive">Competitive</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="preferredTerrains"
            label="Preferred Terrains"
            rules={[{ required: true }]}
          >
            <Select mode="multiple">
              <Option value="road">Road</Option>
              <Option value="trail">Trail</Option>
              <Option value="track">Track</Option>
            </Select>
          </Form.Item>
          <Form.Item name="healthConditions" label="Health Conditions">
            <Select mode="multiple">
              <Option value="asthma">Asthma</Option>
              <Option value="kneeIssues">Knee Issues</Option>
              <Option value="backPain">Back Pain</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Complete Profile Setup
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}

export default ProfileSetupPage;
