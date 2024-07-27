import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/events`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      message.error("Failed to fetch events");
    }
  };

  const handleCreateEvent = async (values) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/events`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(values),
        }
      );
      if (!response.ok) throw new Error("Failed to create event");
      message.success("Event created successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchEvents();
    } catch (error) {
      message.error("Failed to create event");
    }
  };

  return (
    <div>
      <Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
        Create Event
      </Button>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={events}
        renderItem={(event) => (
          <List.Item>
            <Card title={event.title} extra={<Button>Join</Button>}>
              <p>{event.description}</p>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Location: {event.location}</p>
            </Card>
          </List.Item>
        )}
      />
      <Modal
        title="Create Event"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateEvent}>
          <Form.Item name="title" rules={[{ required: true }]}>
            <Input placeholder="Event Title" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder="Description" />
          </Form.Item>
          <Form.Item name="date" rules={[{ required: true }]}>
            <DatePicker showTime />
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

export default EventList;
