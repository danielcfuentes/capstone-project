import React, { useState, useEffect } from "react";
import { List, Card, Typography } from "antd";
import { getHeaders } from "../../utils/apiConfig";

const { Title, Text } = Typography;

const UpcomingEvents = ({ clubId }) => {
  const [events, setEvents] = useState([]);

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
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <div>
      <Title level={4}>Upcoming Events</Title>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={events}
        renderItem={(event) => (
          <List.Item>
            <Card title={event.title}>
              <Text strong>Date: </Text>
              <Text>{new Date(event.date).toLocaleString()}</Text>
              <br />
              <Text strong>Location: </Text>
              <Text>{event.location}</Text>
              <br />
              <Text>{event.description}</Text>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default UpcomingEvents;
