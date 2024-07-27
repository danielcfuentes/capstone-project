import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";

const { Option } = Select;

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEvents();
    fetchClubs();
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

  const handleCreateEvent = async (values) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${
          values.clubId
        }/events`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            ...values,
            date: values.date.toISOString(),
          }),
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
      <Button
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        className="create-button"
      >
        Create Event
      </Button>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={events}
        renderItem={(event) => (
          <List.Item>
            <Card title={event.title} extra={<Button>Join</Button>}>
              <p>{event.description}</p>
              <p>Date: {new Date(event.date).toLocaleString()}</p>
              <p>Location: {event.location}</p>
              <p>Club: {event.club.name}</p>
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
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please enter an event title" }]}
          >
            <Input placeholder="Event Title" />
          </Form.Item>
          <Form.Item name="description">
            <Input.TextArea placeholder="Description" />
          </Form.Item>
          <Form.Item
            name="date"
            rules={[
              { required: true, message: "Please select a date and time" },
            ]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="location"
            rules={[{ required: true, message: "Please enter a location" }]}
          >
            <Input placeholder="Location" />
          </Form.Item>
          <Form.Item
            name="clubId"
            rules={[{ required: true, message: "Please select a run club" }]}
          >
            <Select placeholder="Select Run Club">
              {clubs.map((club) => (
                <Option key={club.id} value={club.id}>
                  {club.name}
                </Option>
              ))}
            </Select>
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
