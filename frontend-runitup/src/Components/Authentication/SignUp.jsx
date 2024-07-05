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
} from "antd";
import { UserOutlined, LockOutlined, RightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { DEFAULT_HEADERS } from "../../utils/apiConfig";
import "../../styles/SignUp.css"; // Import the CSS file

const { Title, Text } = Typography;
const { Content } = Layout;

const SignUp = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleCreate = (values) => {
    fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/create`, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(values),
    }).then((response) => {
      if (response.ok) {
        navigate("/login");
      } else {
        throw new Error("Failed to create account");
      }
    });
  };

  return (
    <Layout className="signup-layout">
      <Content>
        <Row justify="center" align="middle" className="signup-row">
          <Col xs={22} sm={20} md={16} lg={12} xl={8}>
            <Card className="signup-card">
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
              >
                <div className="signup-header">
                  <Title level={2}>Run It Up</Title>
                  <Text type="secondary">Sign up to start your journey</Text>
                </div>

                <Form
                  form={form}
                  name="signup"
                  onFinish={handleCreate}
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
                      icon={<RightOutlined />}
                    >
                      Sign Up
                    </Button>
                  </Form.Item>
                </Form>

                <Text className="login-link">
                  Already have an account?{" "}
                  <Button type="link" onClick={() => navigate("/login")}>
                    Log in
                  </Button>
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default SignUp;
