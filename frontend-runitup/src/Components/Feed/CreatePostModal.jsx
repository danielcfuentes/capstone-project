import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
  message,
  Typography,
  Divider,
} from "antd";
import {
  PictureOutlined,
  SendOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getAuthHeaders } from "../../utils/apiConfig";
import "../../styles/CreateModal.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

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
      onSubmit(newPost);
      message.success("Post created successfully!");
      form.resetFields();
      setFileList([]);
      onClose();
    } catch (error) {
      message.error("Error creating post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
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
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={500}
      className="create-post-modal"
      centered
      closeIcon={<CloseOutlined className="close-icon" />}
    >
      <div className="modal-content">
        <div className="modal-header">
          <Title level={3}>Create a New Post</Title>
          <Text type="secondary">Share your thoughts and moments</Text>
        </div>
        <Divider />
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
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
