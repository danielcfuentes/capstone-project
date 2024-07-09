import React from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Layout,
  Row,
  Col,
  Card,
  Space,
  message,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { DEFAULT_HEADERS } from "../../utils/apiConfig";
import "../../styles/LoginPage.css";

const { Title, Text } = Typography;
const { Content } = Layout;

function LoginPage({ onLogin }) {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = (values) => {
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/login`, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(values),
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          return data;
        } else {
          throw new Error(data.message || "Failed to login");
        }
      })
      .then((data) => {
        onLogin(
          { name: values.username, isProfileComplete: data.isProfileComplete },
          data.accessToken,
          data.refreshToken
        );
        message.success("Login successful!");
        if (data.isProfileComplete) {
          navigate("/feed");
        } else {
          navigate("/profile-setup");
        }
      })
      .catch((error) => {
        if (error.message === "User not found") {
          message.error(
            "User not found. Please check your username or sign up."
          );
        } else if (error.message === "Invalid password") {
          message.error("Invalid password. Please try again.");
        } else {
          message.error("Login failed. Please try again.");
        }
      });
  };

  return (
    <Layout className="login-layout">
      <Content>
        <Row justify="center" align="middle" className="login-row">
          <Col xs={22} sm={20} md={16} lg={12} xl={8}>
            <Card className="login-card">
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div className="login-header">
                  <Title level={2}>Run It Up</Title>
                  <Text type="secondary">Login to your account</Text>
                </div>

                <Form
                  form={form}
                  name="login"
                  onFinish={handleLogin}
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Please input your username!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Username"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Password"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      icon={<LoginOutlined />}
                    >
                      Login
                    </Button>
                  </Form.Item>
                </Form>

                <Text className="signup-link">
                  Need an account?{" "}
                  <Button type="link" onClick={() => navigate("/signup")}>
                    Sign Up
                  </Button>
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default LoginPage;
