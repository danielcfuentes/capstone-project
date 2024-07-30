import React from "react";
import { List, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { generateColor } from "../../utils/apiConfig";

const { Title } = Typography;

const ClubMembersList = ({ club, currentUser }) => {
  if (!club || !club.members) return <div>Loading members...</div>;

  return (
    <div className="members-list">
      <Title level={4}>Club Members</Title>
      <List
        itemLayout="horizontal"
        dataSource={club.members}
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
