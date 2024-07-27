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
} from "antd";
import { PlusOutlined, CrownOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getHeaders } from "../../utils/apiConfig";

const RunClubList = ({ user }) => {
  const [clubs, setClubs] = useState([]);
  const [userClubs, setUserClubs] = useState([]); // Track user's clubs
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClubs();
    fetchUserClubs(); // Fetch user's clubs
  }, [user]);

  const fetchClubs = async () => {
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
    }
  };

  const fetchUserClubs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/user/owned-clubs`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch user clubs");
      const data = await response.json();
      setUserClubs(data.map((club) => club.id)); // Track club IDs user is part of
    } catch (error) {
      message.error("Failed to fetch user clubs");
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
      await fetchClubs(); // Fetch updated list of clubs
      await fetchUserClubs(); // Update user's club list
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

  return (
    <div>
      <Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
        Create Run Club
      </Button>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={clubs}
        renderItem={(club) => {
          const isUserInClub = userClubs.includes(club.id);
          const isOwner = club.owner.username === user.name;

          return (
            <List.Item>
              <Card
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
                          isUserInClub ? "leave" : "join"
                        )
                      }
                      disabled={isOwner}
                    >
                      {isUserInClub ? "Leave" : "Join"}
                    </Button>
                  )
                }
              >
                <Card.Meta
                  avatar={
                    <Avatar src={`data:image/jpeg;base64,${club.logo}`} />
                  }
                  title={`Location: ${club.location}`}
                  description={`Members: ${club._count.members} | Owner: ${club.owner.username}`}
                />
                <p>{club.description}</p>
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
        <Form form={form} onFinish={handleCreateClub}>
          <Form.Item name="name" rules={[{ required: true }]}>
            <Input placeholder="Club Name" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder="Description" />
          </Form.Item>
          <Form.Item name="location" rules={[{ required: true }]}>
            <Input placeholder="Location" />
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
