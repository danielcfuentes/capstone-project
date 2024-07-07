import React, { useState, useEffect } from "react";
import { Layout, List, Spin, Alert, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
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
  };

  return (
    <Layout className="feed-page">
      <Content className="feed-content">
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
                <PostCard post={post} />
              </List.Item>
            )}
          />
        </Spin>
      </Content>
      <AddButton onPostCreated={handlePostCreated} />
    </Layout>
  );
};

export default FeedPage;
