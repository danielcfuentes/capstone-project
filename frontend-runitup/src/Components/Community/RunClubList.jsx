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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [error, setError] = useState(null);
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
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch run clubs");
        }
        const data = await response.json();
        setClubs(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching run clubs:", error);
        setError(error.message);
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

      // Update local state
      setClubs(
        clubs.map((club) => {
          if (club.id === clubId) {
            return {
              ...club,
              _count: {
                ...club._count,
                members:
                  action === "join"
                    ? club._count.members + 1
                    : club._count.members - 1,
              },
              isUserMember: action === "join",
            };
          }
          return club;
        })
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

  return (
    <div>
      <Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
        Create Run Club
      </Button>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={clubs}
        renderItem={(club) => {
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
                          club.isUserMember ? "leave" : "join"
                        )
                      }
                      disabled={isOwner}
                    >
                      {club.isUserMember ? "Leave" : "Join"}
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
