import React, { useState, useEffect } from "react";
import { List, Avatar, Typography } from "antd";
import { getHeaders, generateColor } from "../../utils/apiConfig";

const { Title } = Typography;

const ClubMembersList = ({ clubId }) => {
  const [members, setMembers] = useState([]);

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
      console.error("Error fetching members:", error);
    }
  };

  return (
    <div>
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
                >
                  {member.username[0].toUpperCase()}
                </Avatar>
              }
              title={member.username}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ClubMembersList;
