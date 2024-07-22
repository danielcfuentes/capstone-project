import React, { useState, useEffect } from "react";
import {
  List,
  Avatar,
  Form,
  Input,
  Button,
  message,
  Typography,
  Space,
} from "antd";
import { getHeaders, generateColor } from "../../utils/apiConfig";

const { TextArea } = Input;
const { Text } = Typography;

const CommentSection = ({ postId, onCommentAdded, limit, fullView }) => {
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
        }/posts/${postId}/comments?offset=${offset}&limit=${limit || 10}`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments((prevComments) =>
        offset === 0 ? data : [...prevComments, ...data]
      );
      setHasMore(data.length === (limit || 10));
    } catch (error) {
      message.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!value) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ content: value }),
        }
      );
      if (!response.ok) throw new Error("Failed to add comment");
      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setValue("");
      if (onCommentAdded) onCommentAdded();
      message.success("Comment added successfully");
    } catch (error) {
      message.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const loadMoreComments = () => {
    fetchComments(comments.length);
  };

  return (
    <div>
      <List
        dataSource={comments}
        header={`${comments.length} ${
          comments.length > 1 ? "comments" : "comment"
        }`}
        itemLayout="horizontal"
        renderItem={(comment) => (
          <List.Item>
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
                <Space direction="vertical">
                  <Text>{comment.content}</Text>
                  <Text type="secondary">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        loadMore={
          fullView &&
          hasMore && (
            <div
              style={{
                textAlign: "center",
                marginTop: 12,
                height: 32,
                lineHeight: "32px",
              }}
            >
              <Button onClick={loadMoreComments} loading={loading}>
                Load More
              </Button>
            </div>
          )
        }
      />
      <Form onFinish={handleSubmit}>
        <Form.Item>
          <TextArea
            rows={4}
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" loading={submitting} type="primary">
            Add Comment
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommentSection;
