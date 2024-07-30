import React from "react";
import { Layout } from "antd";
import RunClubList from "./RunClubList";
const { Content } = Layout;

const CommunityPage = ({ currentUser }) => {
  return (
    <Layout className="community-page">
      <Content className="community-content">
        <RunClubList currentUser={currentUser} />
      </Content>
    </Layout>
  );
};

export default CommunityPage;
