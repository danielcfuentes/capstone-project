import React, { useState, useEffect } from "react";
import { List, Avatar, Typography, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";

const { Title } = Typography;

const ClubMembersList = ({ clubId, currentUser }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [clubId]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/run-clubs/${clubId}/members`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch members");
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      message.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="members-list">
      <Title level={4}>Club Members</Title>
      <List
        loading={loading}
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
                <span className={member.username === currentUser.name ? "current-user" : ""}>
                  {member.username}
                  {member.username === currentUser.name && " (You)"}
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
