import React, { useState, useEffect } from "react";
import { List, Card, Avatar, Button, Modal, Form, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom"; // Import Link
import { getHeaders } from "../../utils/apiConfig";

const RunClubList = () => {
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
      if (!response.ok) throw new Error("Failed to fetch run clubs");
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      message.error("Failed to fetch run clubs");
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
        renderItem={(club) => (
          <List.Item>
            <Card
              title={<Link to={`/run-clubs/${club.id}`}>{club.name}</Link>} // Add Link to RunClubDetail
              extra={<Button>Join</Button>}
            >
              <Card.Meta
                avatar={<Avatar src={`data:image/jpeg;base64,${club.logo}`} />}
                title={`Location: ${club.location}`}
                description={`Members: ${club._count.members}`}
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
