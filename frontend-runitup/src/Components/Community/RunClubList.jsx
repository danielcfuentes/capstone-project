import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  CrownOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/RunClubList.css";

const RunClubList = ({ user }) => {
  const [clubs, setClubs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch run clubs");
      }
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      message.error("Failed to fetch run clubs");
    }
  };

  const handleJoinOrLeaveClub = async (clubId, action) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/${action}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error(`Failed to ${action} run club`);

      message.success(
        `Successfully ${action === "join" ? "joined" : "left"} the run club`
      );
      fetchClubs(); // Refetch clubs to update the state
    } catch (error) {
      message.error(`Failed to ${action} run club`);
    }
  };

  const handleCreateClub = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("location", values.location);
      if (values.logo && values.logo[0]) {
        formData.append("logo", values.logo[0].originFileObj);
      }

      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs`,
        {
          method: "POST",
          headers: getHeaders(),
          body: formData,
        }
      );
      if (!response.ok) throw new Error("Failed to create run club");
      message.success("Run club created successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchClubs();
    } catch (error) {
      message.error("Failed to create run club");
    }
  };

  return (
    <div className="run-club-list">
      <Button
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        type="primary"
        style={{ marginBottom: 16 }}
      >
        Create Run Club
      </Button>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={clubs}
        renderItem={(club) => {
          const isOwner = club.owner.username === user.name;

          return (
            <List.Item>
              <Card
                className="run-club-card"
                title={<Link to={`/run-clubs/${club.id}`}>{club.name}</Link>}
                extra={
                  isOwner ? (
                    <Tooltip title="You are the owner">
                      <CrownOutlined style={{ color: "gold" }} />
                    </Tooltip>
                  ) : (
                    <Button
                      onClick={() =>
                        handleJoinOrLeaveClub(
                          club.id,
                          club.isUserMember ? "leave" : "join"
                        )
                      }
                      disabled={isOwner}
                      type={club.isUserMember ? "default" : "primary"}
                    >
                      {club.isUserMember ? "Leave" : "Join"}
                    </Button>
                  )
                }
              >
                <Card.Meta
                  title={club.location}
                  description={
                    <Row>
                      <Col span={12}>
                        <UsergroupAddOutlined /> {club._count.members} members
                      </Col>
                      <Col span={12}>Owner: {club.owner.username}</Col>
                    </Row>
                  }
                />
                <p style={{ marginTop: 16 }}>{club.description}</p>
              </Card>
            </List.Item>
          );
        }}
      />
      <Modal
        title="Create Run Club"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateClub} layout="vertical">
          <Form.Item
            name="name"
            label="Club Name"
            rules={[{ required: true, message: "Please enter a club name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter a location" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RunClubList;
