import React, { useState } from "react";
import {
  Card,
  Avatar,
  Typography,
  Space,
  Image,
  Carousel,
  Button,
  Modal,
} from "antd";
import {
  HeartOutlined,
  HeartFilled,
  MessageOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import "../../styles/PostCard.css";
import { generateColor } from "../../utils/apiConfig";
import CommentSection from "./CommentSection";

const { Text, Paragraph, Title } = Typography;

const PostCard = ({ post, onLike, onCommentAdded }) => {
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);

  const avatarColor = generateColor(post.userId);
  const userInitial = post.userId.charAt(0).toUpperCase();
  const hasImages = post.images && post.images.length > 0;

  const handleLike = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/posts/${post.id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));
        if (onLike) {
          onLike(post.id, !isLiked);
        }
      } else {
        message.error("Failed to update like");
      }
    } catch (error) {
      message.error("Error updating like:", error);
    }
  };

  const handleCommentClick = () => {
    setIsCommentModalVisible(true);
  };

  const handleCommentModalClose = () => {
    setIsCommentModalVisible(false);
  };

  const handleCommentAdded = () => {
    setCommentCount((prevCount) => prevCount + 1);
    if (onCommentAdded) {
      onCommentAdded(post.id);
    }
  };

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
        <Button
          type="text"
          icon={
            isLiked ? (
              <HeartFilled style={{ color: "#ff4d4f" }} />
            ) : (
              <HeartOutlined />
            )
          }
          onClick={handleLike}
        >
          Like ({likeCount})
        </Button>
        <Button
          type="text"
          icon={<MessageOutlined />}
          onClick={handleCommentClick}
        >
          Comment ({commentCount})
        </Button>
        <Button type="text" icon={<ShareAltOutlined />}>
          Share
        </Button>
      </div>

      <Modal
        title={`Comments on "${post.title}"`}
        visible={isCommentModalVisible}
        onCancel={handleCommentModalClose}
        footer={null}
        width={600}
      >
        <CommentSection
          postId={post.id}
          onCommentAdded={handleCommentAdded}
          fullView={true}
        />
      </Modal>
    </Card>
  );
};

export default PostCard;
