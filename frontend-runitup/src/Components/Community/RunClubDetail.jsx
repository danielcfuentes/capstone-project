import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, message, Button } from "antd";
import { getHeaders } from "../../utils/apiConfig";

const RunClubDetail = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);

  useEffect(() => {
    fetchClubDetail();
  }, [id]);

  const fetchClubDetail = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${id}`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch run club details");
      const data = await response.json();
      setClub(data);
    } catch (error) {
      message.error("Failed to fetch run club details");
    }
  };

  if (!club) return <div>Loading...</div>;

  return (
    <Card title={club.name} extra={<Button>Join</Button>}>
      <Card.Meta
        avatar={<Avatar src={`data:image/jpeg;base64,${club.logo}`} />}
        title={`Location: ${club.location}`}
        description={`Members: ${club._count.members}`}
      />
      <p>{club.description}</p>
    </Card>
  );
};

export default RunClubDetail;
