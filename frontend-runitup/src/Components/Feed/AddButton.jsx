import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CreatePostModal from "./CreatePostModal";
import "../../styles/AddButton.css";

const AddButton = ({ onPostCreated }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmitPost = (newPost) => {
    onPostCreated(newPost);
  };

  return (
    <>
      <Tooltip title="Create New Post" placement="left">
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="large"
          className="add-button"
          onClick={handleOpenModal}
        />
      </Tooltip>
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPost}
      />
    </>
  );
};

export default AddButton;
