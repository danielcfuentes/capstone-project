import React, { useState } from "react";
import { Card, Input, Button } from "antd";
import { PictureOutlined, SendOutlined } from "@ant-design/icons";
import CreatePostModal from "./CreatePostModal";
import "../../styles/CreatePostCard.css";

const { TextArea } = Input;

const CreatePostCard = ({ onPostCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <Card className="create-post-card">
      <TextArea
        placeholder="What's on your mind?"
        autoSize={{ minRows: 2, maxRows: 4 }}
        onClick={handleOpenModal}
        readOnly
      />
      <div className="create-post-actions">
        <Button icon={<PictureOutlined />} onClick={handleOpenModal}>
          Add Photo
        </Button>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleOpenModal}
        >
          Create Post
        </Button>
      </div>
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={onPostCreated}
      />
    </Card>
  );
};

export default CreatePostCard;
