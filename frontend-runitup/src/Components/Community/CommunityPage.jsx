import React, { useState, useEffect } from "react";
import { Layout, Typography, Tabs } from "antd";
import RunClubList from "./RunClubList";
import "../../styles/CommunityPage.css";

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const CommunityPage = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <Layout className="community-page">
      <Content className="community-content">
        <Title level={2}>Running Community</Title>

        <RunClubList user={currentUser} />
      </Content>
    </Layout>
  );
};

export default CommunityPage;
