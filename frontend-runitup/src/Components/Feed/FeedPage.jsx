import React, { useState, useEffect, useRef } from "react";
import { Layout, List, Spin, Alert, Typography, BackTop } from "antd";
import { LoadingOutlined, UpOutlined } from "@ant-design/icons";
import PostCard from "./PostCard";
import CreatePostCard from "./CreatePostCard";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/FeedPage.css";
import { formatDistanceToNow, format } from "date-fns";

const { Content } = Layout;
const { Title } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const feedRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/allposts`,
        {
          headers: getHeaders(),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      setError("Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    feedRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePostLiked = (postId, isLiked) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLikedByUser: isLiked,
              likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
            }
          : post
      )
    );
  };

  const handleCommentAdded = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, commentCount: post.commentCount + 1 }
          : post
      )
    );
  };

  return (
    <Layout className="feed-page">
      <Content className="feed-content">
        <div ref={feedRef}></div>
        <CreatePostCard onPostCreated={handlePostCreated} />
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="error-alert"
          />
        )}
        <Spin spinning={loading} indicator={antIcon}>
          <List
            itemLayout="vertical"
            size="large"
            dataSource={posts}
            renderItem={(post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handlePostLiked}
                onCommentAdded={handleCommentAdded}
                formatDate={(date) => {
                  const now = new Date();
                  const postDate = new Date(date);
                  const diff = now - postDate;
                  if (diff < 24 * 60 * 60 * 1000) {
                    return formatDistanceToNow(postDate, { addSuffix: true });
                  } else {
                    return format(postDate, "MMM d, yyyy");
                  }
                }}
              />
            )}
          />
        </Spin>
      </Content>
      <BackTop className="back-top-left">
        <div className="back-top-inner">
          <UpOutlined />
        </div>
      </BackTop>
    </Layout>
  );
};

export default FeedPage;
