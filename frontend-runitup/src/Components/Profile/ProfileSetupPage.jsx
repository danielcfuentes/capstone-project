import React from "react";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Layout,
  message,
  Typography,
  Card,
  Space,
} from "antd";
import {
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/ProfileSetupPage.css";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

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
      console.error("Error updating profile:", error);
      message.error(`Error updating profile: ${error.message}`);
    }
  };

  return (
    <Layout className="profile-setup-page">
      <Content className="profile-setup-content">
        <Card className="profile-setup-card">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div className="profile-setup-header">
              <Title level={2}>Welcome to Run It Up!</Title>
              <Text type="secondary">
                Let's set up your profile to get started
              </Text>
            </div>

            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                name="age"
                label="Age"
                rules={[{ required: true, message: "Please input your age!" }]}
              >
                <InputNumber min={1} max={120} prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Gender"
                rules={[
                  { required: true, message: "Please select your gender!" },
                ]}
              >
                <Select>
                  <Option value="male">
                    <ManOutlined /> Male
                  </Option>
                  <Option value="female">
                    <WomanOutlined /> Female
                  </Option>
                  <Option value="other">
                    <UserOutlined /> Other
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="weight"
                label="Weight (lbs)"
                rules={[
                  { required: true, message: "Please input your weight!" },
                ]}
              >
                <InputNumber min={1} max={300} prefix={<DashboardOutlined />} />
              </Form.Item>

              <Form.Item
                name="height"
                label="Height (ft.in)"
                rules={[
                  { required: true, message: "Please input your height!" },
                ]}
              >
                <InputNumber min={1} max={300} prefix={<DashboardOutlined />} />
              </Form.Item>

              <Form.Item
                name="fitnessLevel"
                label="Fitness Level"
                rules={[
                  {
                    required: true,
                    message: "Please select your fitness level!",
                  },
                ]}
              >
                <Select>
                  <Option value="beginner">
                    <ThunderboltOutlined /> Beginner
                  </Option>
                  <Option value="intermediate">
                    <ThunderboltOutlined /> Intermediate
                  </Option>
                  <Option value="advanced">
                    <ThunderboltOutlined /> Advanced
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="runningExperience"
                label="Running Experience"
                rules={[
                  {
                    required: true,
                    message: "Please select your running experience!",
                  },
                ]}
              >
                <Select>
                  <Option value="novice">
                    <UserOutlined /> Novice
                  </Option>
                  <Option value="recreational">
                    <UserOutlined /> Recreational
                  </Option>
                  <Option value="competitive">
                    <UserOutlined /> Competitive
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="preferredTerrains"
                label="Preferred Terrains"
                rules={[
                  {
                    required: true,
                    message: "Please select your preferred terrains!",
                  },
                ]}
              >
                <Select mode="multiple">
                  <Option value="road">
                    <EnvironmentOutlined /> Road
                  </Option>
                  <Option value="trail">
                    <EnvironmentOutlined /> Trail
                  </Option>
                  <Option value="track">
                    <EnvironmentOutlined /> Track
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item name="healthConditions" label="Health Conditions">
                <Select mode="multiple">
                  <Option value="asthma">
                    <HeartOutlined /> Asthma
                  </Option>
                  <Option value="kneeIssues">
                    <HeartOutlined /> Knee Issues
                  </Option>
                  <Option value="backPain">
                    <HeartOutlined /> Back Pain
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large" block>
                  Complete Profile Setup
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}

export default ProfileSetupPage;
