import React, { useState, useEffect } from "react";
import { Layout, Typography, Tabs } from "antd";
import RunClubList from "./RunClubList";
import EventList from "./EventList";

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <Layout className="community-page">
      <Content className="community-content">
        <Title level={2}>Running Community</Title>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Run Clubs" key="1">
            <RunClubList />
          </TabPane>
          <TabPane tab="Events" key="2">
            <EventList />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default CommunityPage;