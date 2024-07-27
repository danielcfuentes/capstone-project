import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getHeaders, generateColor } from "../../utils/apiConfig";

const RunClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

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
      if (!response.ok) throw new Error("Failed to fetch run clubs");
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      message.error("Failed to fetch run clubs");
    }
  };

  const handleCreateClub = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key !== "logo") {
          formData.append(key, values[key]);
        }
      });
      if (fileList.length > 0) {
        formData.append("logo", fileList[0].originFileObj);
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
      setFileList([]);
      fetchClubs();
    } catch (error) {
      message.error("Failed to create run club");
    }
  };

  const handleJoinClub = async (clubId, ownerId) => {
    if (ownerId === currentUserId) {
      message.info("You already own this club");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/join`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to join run club");
      message.success("Successfully joined the run club");
      fetchClubs();
    } catch (error) {
      message.error("Failed to join run club");
    }
  };

  return (
    <div>
      <Button
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        className="create-button"
      >
        Create Run Club
      </Button>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={clubs}
        renderItem={(club) => (
          <List.Item>
            <Card
              title={
                <Link to={`/community/run-clubs/${club.id}`}>{club.name}</Link>
              }
              extra={
                club.owner.id !== currentUserId && (
                  <Button
                    onClick={() => handleJoinClub(club.id, club.owner.id)}
                  >
                    Join
                  </Button>
                )
              }
            >
              <Card.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: generateColor(club.owner.username),
                    }}
                  >
                    {club.owner.username[0].toUpperCase()}
                  </Avatar>
                }
                title={`Location: ${club.location}`}
                description={
                  <>
                    <p>Members: {club._count.members}</p>
                    <p>Owner: {club.owner.username}</p>
                  </>
                }
              />
            </Card>
          </List.Item>
        )}
      />
      <Modal
        title="Create Run Club"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateClub}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please enter a club name" }]}
          >
            <Input placeholder="Club Name" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder="Description" />
          </Form.Item>
          <Form.Item
            name="location"
            rules={[{ required: true, message: "Please enter a location" }]}
          >
            <Input placeholder="Location" />
          </Form.Item>
          <Form.Item name="logo">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Logo</div>
                </div>
              )}
            </Upload>
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
