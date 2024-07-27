import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, Typography, List, Button, message } from "antd";
import { getHeaders } from "../../utils/apiConfig";

const { Title, Text } = Typography;

const RunClubDetail = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchClubDetails();
    fetchClubMembers();
    fetchClubEvents();
  }, [id]);

  const fetchClubDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${id}`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch club details");
      const data = await response.json();
      setClub(data);
    } catch (error) {
      message.error("Failed to fetch club details");
    }
  };

  const fetchClubMembers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${id}/members`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch club members");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      message.error("Failed to fetch club members");
    }
  };

  const fetchClubEvents = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${id}/events`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch club events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      message.error("Failed to fetch club events");
    }
  };

  if (!club) return <div>Loading...</div>;

  return (
    <div className="run-club-detail">
      <Card>
        <Avatar
          size={64}
          src={club.logo ? `data:image/jpeg;base64,${club.logo}` : null}
        />
        <Title level={2}>{club.name}</Title>
        <Text>{club.description}</Text>
        <Text strong>Location: {club.location}</Text>
      </Card>

      <Card title="Members">
        <List
          dataSource={members}
          renderItem={(member) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{member.username[0].toUpperCase()}</Avatar>}
                title={member.username}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="Upcoming Events">
        <List
          dataSource={events}
          renderItem={(event) => (
            <List.Item>
              <List.Item.Meta
                title={event.title}
                description={`${event.date} - ${event.location}`}
              />
              <Button>Join Event</Button>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default RunClubDetail;

