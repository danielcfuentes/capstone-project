import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Avatar, message, Button, Tabs, Layout } from "antd";
import { getHeaders } from "../../utils/apiConfig";
import ClubChat from "./ClubChat";
import ClubMembersList from "./ClubMembersList";
import ClubStatistics from "./ClubStatistics";
import UpcomingEvents from "./UpcomingEvents";
import "../../styles/RunClubList.css";

const { TabPane } = Tabs;
const { Content } = Layout;

const RunClubDetail = ({ currentUser }) => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [membershipChanged, setMembershipChanged] = useState(false);

  useEffect(() => {
    fetchClubDetail();
  }, [id, membershipChanged]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrLeave = async (action) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${id}/${action}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error(`Failed to ${action} run club`);

      const data = await response.json();
      message.success(data.message);
      setClub((prevClub) => ({
        ...prevClub,
        isUserMember: action === "join",
        memberCount:
          action === "join"
            ? prevClub.memberCount + 1
            : prevClub.memberCount - 1,
      }));
      setMembershipChanged((prev) => !prev);
    } catch (error) {
      message.error(`Failed to ${action} run club`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!club) return <div>Club not found</div>;

  return (
    <Layout className="run-club-detail">
      <Content>
        <Card
          title={club.name}
          extra={
            club.ownerId !== currentUser.id && (
              <Button
                type="primary"
                onClick={() =>
                  handleJoinOrLeave(club.isUserMember ? "leave" : "join")
                }
              >
                {club.isUserMember ? "Leave" : "Join"}
              </Button>
            )
          }
          style={{ marginBottom: 20 }}
        >
          <Card.Meta
            title={`Location: ${club.location}`}
            description={`Members: ${club.memberCount}`}
          />
          <p style={{ marginTop: 16 }}>{club.description}</p>
        </Card>

        <ClubStatistics clubId={id} membershipChanged={membershipChanged} />

        <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
          <TabPane tab="Discussion" key="1">
            <ClubChat clubId={id} currentUser={currentUser} />
          </TabPane>
          <TabPane tab="Events" key="2">
            <UpcomingEvents clubId={id} />
          </TabPane>
          <TabPane tab="Members" key="3">
            <ClubMembersList
              clubId={id}
              currentUser={currentUser}
              membershipChanged={membershipChanged}
            />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default RunClubDetail;
