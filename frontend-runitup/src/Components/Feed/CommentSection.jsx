import React, { useState, useEffect } from "react";
import { List, Avatar, Form, Input, Button, Typography, Divider, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { getHeaders, generateColor } from "../../utils/apiConfig";
import "../../styles/CommentSection.css";

const { TextArea } = Input;
const { Text } = Typography;

const CommentSection = ({ postId, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async (offset = 0) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_POST_ADDRESS
        }/posts/${postId}/comments?offset=${offset}&limit=10`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments((prevComments) =>
        offset === 0 ? data : [...prevComments, ...data]
      );
      setHasMore(data.length === 10);
    } catch (error) {
      message.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!value.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ content: value.trim() }),
        }
      );
      if (!response.ok) throw new Error("Failed to add comment");
      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setValue("");
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      message.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreComments = () => {
    fetchComments(comments.length);
  };

  return (
    <div className="comment-section">
      <List
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item className="comment-item">
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: generateColor(comment.user.username),
                  }}
                >
                  {comment.user.username[0].toUpperCase()}
                </Avatar>
              }
              title={<Text strong>{comment.user.username}</Text>}
              description={
                <>
                  <Text className="comment-content">{comment.content}</Text>
                  <Text type="secondary" className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
      {hasMore && (
        <div className="load-more-container">
          <Button onClick={loadMoreComments} loading={loading}>
            Load More
          </Button>
        </div>
      )}
      <Divider />
      <Form onFinish={handleSubmit} className="comment-form">
        <Form.Item>
          <TextArea
            rows={3}
            onChange={(e) => setValue(e.target.value)}
            value={value}
            placeholder="Write a comment..."
            className="comment-input"
          />
        </Form.Item>
        <Form.Item>
          <Button
            htmlType="submit"
            loading={submitting}
            type="primary"
            icon={<SendOutlined />}
            className="submit-button"
          >
            Post Comment
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommentSection;
