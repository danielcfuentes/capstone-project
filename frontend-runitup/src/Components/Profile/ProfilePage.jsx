import React, { useState, useEffect } from "react";
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
  Row,
  Col,
  Spin,
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
import "../../styles/ProfilePage.css";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

function ProfilePage({ user, onProfileUpdate }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/profile`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const profileData = await response.json();
      form.setFieldsValue(profileData);
      setLoading(false);
    } catch (error) {
      message.error("Error fetching profile");
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/profile`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      message.success("Profile updated successfully");
      if (onProfileUpdate) {
        onProfileUpdate(data);
      }
    } catch (error) {
      message.error(`Error updating profile: ${error.message}`);
    }
  };

  return (
    <Layout className="profile-page">
      <Content className="profile-content">
        <Title level={1} className="page-title">
          {user.name}'s Profile
        </Title>
        <Text type="secondary" className="page-subtitle">
          View and update your information
        </Text>

        <Spin spinning={loading}>
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            className="profile-form"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <Card title="Personal Information" className="info-card">
                  <Form.Item
                    name="age"
                    label="Age"
                    rules={[
                      { required: true, message: "Please input your age!" },
                    ]}
                  >
                    <InputNumber min={1} max={120} className="full-width" />
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
                    <InputNumber min={1} max={1000} className="full-width" />
                  </Form.Item>
                  <Form.Item
                    name="height"
                    label="Height (ft.in)"
                    rules={[
                      { required: true, message: "Please input your height!" },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      max={10}
                      step={0.01}
                      className="full-width"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Running Profile" className="info-card">
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
                </Card>
              </Col>
            </Row>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                className="update-button"
              >
                Update Profile
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Content>
    </Layout>
  );
}

export default ProfilePage;
