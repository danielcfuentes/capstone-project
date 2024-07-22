import React, { useState, useEffect, useRef } from "react";
import { Layout, List, Spin, Alert, Typography, BackTop } from "antd";
import { LoadingOutlined, UpOutlined } from "@ant-design/icons";
import PostCard from "./PostCard";
import AddButton from "./AddButton";
import { getHeaders } from "../../utils/apiConfig";
import "../../styles/FeedPage.css";

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

  return (
    <Layout className="feed-page">
      <Content className="feed-content">
        <div ref={feedRef}></div>
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
              <List.Item key={post.id}>
                <PostCard post={post} onLike={handlePostLiked} />
              </List.Item>
            )}
          />
        </Spin>
      </Content>
      <AddButton onPostCreated={handlePostCreated} />
      <BackTop className="back-top-left">
        <div className="back-top-inner">
          <UpOutlined />
        </div>
      </BackTop>
    </Layout>
  );
};

export default FeedPage;
