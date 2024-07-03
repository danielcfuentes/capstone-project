import React, { useState } from "react";
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
      <button className="add-button" onClick={handleOpenModal}>
        +
      </button>
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPost}
      />
    </>
  );
};

export default AddButton;
