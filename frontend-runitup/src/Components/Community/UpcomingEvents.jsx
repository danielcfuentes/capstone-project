import React, { useState, useEffect } from "react";
import { List, Card, Typography, Button, message } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { getHeaders } from "../../utils/apiConfig";

const { Title, Text } = Typography;

const UpcomingEvents = ({ clubId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/events`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      const upcomingEvents = data.filter(
        (event) => new Date(event.date) > new Date()
      );
      setEvents(upcomingEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/events/${eventId}/join`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to join event");
      message.success("Successfully joined the event");
      fetchEvents(); // Refresh events to update participant count
    } catch (error) {
      message.error("Failed to join event");
    }
  };

  const renderItem = (event) => {
    if (!event) return null;

    return (
      <List.Item>
        <Card className="event-card" title={event.title || "Untitled Event"}>
          <p>
            <CalendarOutlined />{" "}
            {event.date
              ? new Date(event.date).toLocaleString()
              : "Date not set"}
          </p>
          <p>
            <EnvironmentOutlined /> {event.location || "Location not set"}
          </p>
          <p>
            <TeamOutlined /> {event.participantCount || 0} participants
          </p>
          <p>{event.description || "No description available"}</p>
          <Button type="primary" onClick={() => handleJoinEvent(event.id)}>
            Join Event
          </Button>
        </Card>
      </List.Item>
    );
  };

  return (
    <div className="events-list">
      <Title level={4}>Upcoming Events</Title>
      <List loading={loading} dataSource={events} renderItem={renderItem} />
    </div>
  );
};

export default UpcomingEvents;
