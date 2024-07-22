import React, { useState } from "react";
import { Card, Input, Button, Upload, message, Form, Typography } from "antd";
import { PictureOutlined, SendOutlined, EditOutlined } from "@ant-design/icons";
import { getAuthHeaders } from "../../utils/apiConfig";
import "../../styles/CreatePostCard.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreatePostCard = ({ onPostCreated }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => setExpanded(true);
  const handleCollapse = () => setExpanded(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    fileList.forEach((file) => {
      formData.append("images", file.originFileObj);
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_POST_ADDRESS}/posts`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const newPost = await response.json();

      // Add likeCount and commentCount properties to the new post
      const postWithCounts = {
        ...newPost,
        likeCount: 0,
        commentCount: 0,
        isLikedByUser: false,
      };

      onPostCreated(postWithCounts);
      message.success("Post created successfully!");
      form.resetFields();
      setFileList([]);
      handleCollapse();
    } catch (error) {
      message.error("Error creating post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    return false; // Prevent automatic upload
  };

  return (
    <Card className="create-post-card">
      {!expanded ? (
        <div onClick={handleExpand} className="create-post-preview">
          <TextArea
            placeholder="What's on your mind?"
            autoSize={{ minRows: 2, maxRows: 4 }}
            readOnly
          />
          <div className="create-post-actions">
            <Button icon={<PictureOutlined />} />
            <Button type="primary" icon={<EditOutlined />} />
          </div>
        </div>
      ) : (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter post title" className="input-field" />
          </Form.Item>
          <Form.Item
            name="content"
            rules={[{ required: true, message: "Please enter some content" }]}
          >
            <TextArea
              placeholder="What's on your mind?"
              autoSize={{ minRows: 4, maxRows: 8 }}
              className="input-field"
            />
          </Form.Item>
          <Form.Item>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              accept="image/*"
              className="image-uploader"
            >
              {fileList.length >= 8 ? null : (
                <div className="upload-button">
                  <PictureOutlined />
                  <div>Add Photos</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={submitting}
              block
              size="large"
              className="submit-button"
            >
              Create Post
            </Button>
            <Button onClick={handleCollapse} block>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default CreatePostCard;
