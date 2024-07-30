import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Tabs, Layout, message, Spin } from "antd";
import { getHeaders } from "../../utils/apiConfig";
import ClubChat from "./ClubChat";
import ClubMembersList from "./ClubMembersList";
import ClubStatistics from "./ClubStatistics";
import UpcomingEvents from "./UpcomingEvents";

const { Content } = Layout;
const { TabPane } = Tabs;

const RunClubDetail = ({ currentUser }) => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClubDetail = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubDetail();
  }, [id]);

  const handleJoinLeave = async () => {
    try {
      const action = club.isUserMember ? "leave" : "join";
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${id}/${action}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error(`Failed to ${action} club`);
      await fetchClubDetail(); // Fetch updated club details
      message.success(`Successfully ${action}ed the club`);
    } catch (error) {
      message.error(
        `Failed to ${club.isUserMember ? "leave" : "join"} the club`
      );
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  if (!club) {
    return <div>Club not found</div>;
  }

  const isOwner = club.owner.username === currentUser.name;
  return (
    <Layout className="run-club-detail">
      <Content>
        <Card
          title={club.name}
          extra={
            !isOwner && (
              <Button onClick={handleJoinLeave}>
                {club.isUserMember ? "Leave" : "Join"}
              </Button>
            )
          }
        >
          <p>Location: {club.location}</p>
          <p>Members: {club.memberCount}</p>
          <p>{club.description}</p>
        </Card>

        <ClubStatistics clubId={id} key={`stats-${club.memberCount}`} />

        <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
          <TabPane tab="Discussion" key="1">
            <ClubChat clubId={id} currentUser={currentUser} />
          </TabPane>
          <TabPane tab="Events" key="2">
            <UpcomingEvents
              clubId={id}
              isOwner={isOwner}
              currentUser={currentUser}
            />
          </TabPane>
          <TabPane tab="Members" key="3">
            <ClubMembersList
              clubId={id}
              currentUser={currentUser}
              key={`members-${club.memberCount}`}
            />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default RunClubDetail;
