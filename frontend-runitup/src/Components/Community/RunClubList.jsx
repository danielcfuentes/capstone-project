import React, { useState, useEffect } from "react";
import { List, Card, Button, Modal, Form, Input, message, Spin } from "antd";
import {
  PlusOutlined,
  CrownOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/RunClubList.css"
const RunClubList = ({ currentUser }) => {
  const [clubs, setClubs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch run clubs");
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      message.error("Failed to fetch run clubs");
    } finally {
      setLoading(false);
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
      const data = await response.json();
      message.success(data.message);

      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.id === clubId
            ? {
                ...club,
                isUserMember: data.isUserMember,
                memberCount: data.memberCount,
              }
            : club
        )
      );
    } catch (error) {
      message.error(`Failed to ${action} run club`);
    }
  };

  const handleCreateClub = async (values) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(values),
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

  if (loading) {
    return <Spin size="large" />;
  }

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
        grid={{ gutter: 16, column: 3 }}
        dataSource={clubs}
        renderItem={(club) => {
          const isOwner =
            club.owner && club.owner.username === currentUser.name;

          return (
            <List.Item>
              <Card
                title={<Link to={`/run-clubs/${club.id}`}>{club.name}</Link>}
                extra={
                  isOwner ? (
                    <CrownOutlined style={{ color: "gold" }} />
                  ) : (
                    <Button
                      onClick={() =>
                        handleJoinOrLeaveClub(
                          club.id,
                          club.isUserMember ? "leave" : "join"
                        )
                      }
                    >
                      {club.isUserMember ? "Leave" : "Join"}
                    </Button>
                  )
                }
              >
                <p>{club.location || "No location specified"}</p>
                <p>
                  <UsergroupAddOutlined /> {club.memberCount || 0} members
                </p>
                <p>Owner: {club.owner ? club.owner.username : "Unknown"}</p>
                <p>{club.description || "No description available"}</p>
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
