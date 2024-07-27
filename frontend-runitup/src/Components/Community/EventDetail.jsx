import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Typography, List, Button, message } from "antd";
import { getHeaders } from "../../utils/apiConfig";

const { Title, Text } = Typography;

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isParticipating, setIsParticipating] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/events/${id}`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch event details");
      const data = await response.json();
      setEvent(data);
      setIsParticipating(data.participants.some((p) => p.id === currentUserId)); // Assume currentUserId is available
    } catch (error) {
      message.error("Failed to fetch event details");
    }
  };

  const handleJoinLeaveEvent = async () => {
    try {
      const url = `${import.meta.env.VITE_POST_ADDRESS}/events/${id}/${
        isParticipating ? "leave" : "join"
      }`;
      const response = await fetch(url, {
        method: "POST",
        headers: getHeaders(),
      });
      if (!response.ok)
        throw new Error(
          `Failed to ${isParticipating ? "leave" : "join"} event`
        );
      setIsParticipating(!isParticipating);
      message.success(
        `Successfully ${isParticipating ? "left" : "joined"} the event`
      );
    } catch (error) {
      message.error(error.message);
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="event-detail">
      <Card>
        <Title level={2}>{event.title}</Title>
        <Text>{event.description}</Text>
        <Text strong>Date: {new Date(event.date).toLocaleString()}</Text>
        <Text strong>Location: {event.location}</Text>
        <Text strong>Organized by: {event.club.name}</Text>
        <Button onClick={handleJoinLeaveEvent}>
          {isParticipating ? "Leave Event" : "Join Event"}
        </Button>
      </Card>

      <Card title="Participants">
        <List
          dataSource={event.participants}
          renderItem={(participant) => (
            <List.Item>
              <List.Item.Meta title={participant.username} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default EventDetail;
