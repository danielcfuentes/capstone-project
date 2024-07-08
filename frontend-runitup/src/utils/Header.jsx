import React from "react";
import { Layout, Menu, Typography, Avatar, Dropdown } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  ThunderboltOutlined,
  HomeOutlined,
  CompassOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "../styles/Header.css";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = ({ onLogout, user }) => {
  const location = useLocation();

  const menuItems = [
    { key: "feed", label: "Feed", icon: <HomeOutlined />, link: "/feed" },
    {
      key: "routes",
      label: "Routes",
      icon: <CompassOutlined />,
      link: "/routes",
    },

    {
      key: "recommendations",
      label: "Recommendations",
      icon: <CompassOutlined />,
      link: "/recommendations",
    },
  ];

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="header">
      <div className="header-content">
        <div className="logo">
          <ThunderboltOutlined className="logo-icon" />
          <Title level={3}>Run It Up</Title>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname.split("/")[1] || "feed"]}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.link}>{item.label}</Link>,
          }))}
        />
        <div className="user-actions">
          <Dropdown overlay={userMenu} trigger={["click"]}>
            <a
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Avatar>
              <span className="username">{user?.name || "User"}</span>
            </a>
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
