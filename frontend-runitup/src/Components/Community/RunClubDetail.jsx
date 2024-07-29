import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, message, Button, Tabs } from "antd";
import { getHeaders } from "../../utils/apiConfig";
import ClubChat from "./ClubChat";
import ClubMembersList from "./ClubMembersList";
import ClubStatistics from "./ClubStatistics";
import UpcomingEvents from "./UpcomingEvents";

const { TabPane } = Tabs;

const RunClubDetail = ({ currentUser }) => {
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
    <div style={{ padding: "20px" }}>
      <Card title={club.name} extra={<Button>Join</Button>}>
        <Card.Meta
          avatar={<Avatar src={`data:image/jpeg;base64,${club.logo}`} />}
          title={`Location: ${club.location}`}
          description={`Members: ${club._count.members}`}
        />
        <p>{club.description}</p>
      </Card>

      <ClubStatistics clubId={id} />

      <Tabs defaultActiveKey="1" style={{ marginTop: "20px" }}>
        <TabPane tab="Discussion" key="1">
          <ClubChat clubId={id} currentUser={currentUser} />
        </TabPane>
        <TabPane tab="Events" key="2">
          <UpcomingEvents clubId={id} />
        </TabPane>
        <TabPane tab="Members" key="3">
          <ClubMembersList clubId={id} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RunClubDetail;
