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
  Modal,
} from "antd";
import {
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/ProfilePage.css";

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

function ProfilePage({ user, onProfileUpdate }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [updatedValues, setUpdatedValues] = useState(null);

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

  const onFinish = (values) => {
    setUpdatedValues(values);
    setConfirmModalVisible(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/profile`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(updatedValues),
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
      setEditMode(false);
      setConfirmModalVisible(false);
    } catch (error) {
      message.error(`Error updating profile: ${error.message}`);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
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

        <Card className="profile-card">
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
                    <Form.Item name="age" label="Age">
                      <InputNumber
                        disabled={!editMode}
                        className="full-width"
                      />
                    </Form.Item>
                    <Form.Item name="gender" label="Gender">
                      <Select disabled={!editMode}>
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
                    <Form.Item name="weight" label="Weight (lbs)">
                      <InputNumber
                        disabled={!editMode}
                        className="full-width"
                      />
                    </Form.Item>
                    <Form.Item name="height" label="Height (ft.in)">
                      <InputNumber
                        disabled={!editMode}
                        step={0.01}
                        className="full-width"
                      />
                    </Form.Item>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="Running Profile" className="info-card">
                    <Form.Item name="fitnessLevel" label="Fitness Level">
                      <Select disabled={!editMode}>
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
                    >
                      <Select disabled={!editMode}>
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
                    >
                      <Select mode="multiple" disabled={!editMode}>
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
                    <Form.Item
                      name="healthConditions"
                      label="Health Conditions"
                    >
                      <Select mode="multiple" disabled={!editMode}>
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
              {editMode ? (
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    className="update-button"
                    icon={<SaveOutlined />}
                  >
                    Save Changes
                  </Button>
                </Form.Item>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  block
                  className="edit-button"
                  onClick={toggleEditMode}
                  icon={<EditOutlined />}
                >
                  Edit Your Profile
                </Button>
              )}
            </Form>
          </Spin>
        </Card>

        <Modal
          title="Confirm Profile Update"
          visible={confirmModalVisible}
          onOk={handleConfirmUpdate}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Confirm"
          cancelText="Cancel"
        >
          <p>
            Are you sure you want to update your profile with these changes?
          </p>
        </Modal>
      </Content>
    </Layout>
  );
}

export default ProfilePage;
