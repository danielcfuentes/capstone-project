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

const UpcomingEvents = ({ clubId, isOwner, currentUser }) => {
  const [events, setEvents] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/events`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      message.error("Error fetching events");
    }
  };

  const handleCreateEvent = async (values) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/events`,
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
      fetchEvents(); // Refetch events after creating a new one
    } catch (error) {
      message.error("Error creating event");
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/events/${eventId}/rsvp`,
        { method: "POST", headers: getHeaders() }
      );
      if (!response.ok) throw new Error("Failed to update RSVP");
      const data = await response.json();
      message.success(data.message);
      fetchEvents(); // Refetch events after RSVP action
    } catch (error) {
      message.error("Error updating RSVP");
    }
  };

  return (
    <div>
      {isOwner && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ marginBottom: 16 }}
        >
          Create Event
        </Button>
      )}
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={events}
        renderItem={(event) => (
          <List.Item>
            <Card
              title={event.title}
              extra={
                <Button
                  type={event.isUserRSVPd ? "default" : "primary"}
                  onClick={() => handleRSVP(event.id)}
                >
                  {event.isUserRSVPd ? "Cancel RSVP" : "RSVP"}
                </Button>
              }
            >
              <p>{event.description}</p>
              <p>Date: {new Date(event.date).toLocaleString()}</p>
              <p>Location: {event.location}</p>
              <p>Participants: {event.participantCount}</p>
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
        <Form form={form} onFinish={handleCreateEvent} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Event
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UpcomingEvents;
