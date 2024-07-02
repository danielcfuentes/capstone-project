import "../../styles/AddButton.css"
import { useState } from "react";
import CreatePostModal from "./CreatePostModal";

const AddButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmitPost = (postData) => {
    // Here you would typically send the post data to your backend
    console.log("Submitting post:", postData);
    // After submitting, you might want to refresh the feed or add the new post to the existing list
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
