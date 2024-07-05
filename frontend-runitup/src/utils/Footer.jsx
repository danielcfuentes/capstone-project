import React from "react";
import { Layout, Row, Col, Typography, Space } from "antd";
import { HeartFilled } from "@ant-design/icons";
import "../styles/Footer.css";

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer = () => {
  return (
    <AntFooter className="footer">
      <Row justify="space-between" align="middle">
        <Col xs={24} sm={8}>
          <Text strong>Run It Up</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Space size="large" className="center-links">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
          </Space>
        </Col>
        <Col xs={24} sm={8} className="right-align">
          <Text type="secondary">
            Made by Daniel Camilo Fuentes © {new Date().getFullYear()}
          </Text>
        </Col>
      </Row>
    </AntFooter>
  );
};

export default Footer;
