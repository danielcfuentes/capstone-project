import React, { useState, useEffect } from "react";
import { List, Comment, Avatar, Form, Input, Button, message } from "antd";
import { getHeaders, generateColor } from "../../utils/apiConfig";

const { TextArea } = Input;

const CommentSection = ({ postId, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/posts/${postId}/comments`,
        { headers: getHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      message.error("Failed to load comments");
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

  return (
    <div>
      <List
        dataSource={comments}
        header={`${comments.length} ${
          comments.length > 1 ? "comments" : "comment"
        }`}
        itemLayout="horizontal"
        renderItem={(comment) => (
          <li>
            <Comment
              author={comment.user.username}
              avatar={
                <Avatar
                  style={{
                    backgroundColor: generateColor(comment.user.username),
                  }}
                >
                  {comment.user.username[0].toUpperCase()}
                </Avatar>
              }
              content={comment.content}
              datetime={new Date(comment.createdAt).toLocaleString()}
            />
          </li>
        )}
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
