import React from "react";
import { Card, Avatar, Typography, Space, Image, Carousel, Button } from "antd";
import {
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import "../../styles/PostCard.css";
import { generateColor } from "../../utils/apiConfig";

const { Text, Paragraph, Title } = Typography;

const PostCard = ({ post }) => {
  const avatarColor = generateColor(post.userId);
  const userInitial = post.userId.charAt(0).toUpperCase();
  const hasImages = post.images && post.images.length > 0;

  const renderImages = () => {
    if (!hasImages) return null;

    if (post.images.length === 1) {
      return (
        <Image
          src={`${import.meta.env.VITE_POST_ADDRESS}/images/${
            post.images[0].id
          }`}
          alt="Post image"
          className="post-image"
        />
      );
    }

    return (
      <Carousel autoplay className="post-carousel">
        {post.images.map((image, index) => (
          <div key={index}>
            <Image
              src={`${import.meta.env.VITE_POST_ADDRESS}/images/${image.id}`}
              alt={`Post image ${index + 1}`}
              className="post-image"
            />
          </div>
        ))}
      </Carousel>
    );
  };

  return (
    <Card className="post-card" bodyStyle={{ padding: 0 }}>
      <div className="post-header">
        <Space>
          <Avatar
            style={{ backgroundColor: avatarColor, verticalAlign: "middle" }}
            size="large"
          >
            {userInitial}
          </Avatar>
          <Text strong>{post.userId}</Text>
        </Space>
        <Text type="secondary" className="post-date">
          {new Date(post.createdAt).toLocaleDateString()}
        </Text>
      </div>
      {hasImages && (
        <div className="post-image-container">{renderImages()}</div>
      )}
      <div className="post-content">
        <Title level={3} className="post-title">
          {post.title}
        </Title>
        <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "more" }}>
          {post.content}
        </Paragraph>
      </div>
      <div className="post-actions">
        <Button type="text" icon={<HeartOutlined />}>
          Like
        </Button>
        <Button type="text" icon={<MessageOutlined />}>
          Comment
        </Button>
        <Button type="text" icon={<ShareAltOutlined />}>
          Share
        </Button>
      </div>
    </Card>
  );
};

export default PostCard;
