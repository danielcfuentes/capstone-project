import React, { useState, useEffect } from "react";
import { List, Avatar, Typography, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";

const { Title } = Typography;

const ClubMembersList = ({ clubId, currentUser }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/members`,
          { headers: getHeaders() }
        );
        if (!response.ok) throw new Error("Failed to fetch members");
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [clubId]);

  if (loading) return <Spin size="large" />;
  if (members.length === 0) return <div>No members found</div>;

  return (
    <div className="members-list">
      <Title level={4}>Club Members</Title>
      <List
        itemLayout="horizontal"
        dataSource={members}
        renderItem={(member) => (
          <List.Item>
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{ backgroundColor: generateColor(member.username) }}
                  icon={<UserOutlined />}
                >
                  {member.username[0].toUpperCase()}
                </Avatar>
              }
              title={
                <span
                  className={member.id === currentUser.id ? "current-user" : ""}
                >
                  {member.username}
                  {member.id === currentUser.id && " (You)"}
                </span>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ClubMembersList;
