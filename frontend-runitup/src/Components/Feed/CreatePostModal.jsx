import React, { useState } from "react";
import "../../styles/CreateModal.css";
import { getAuthHeaders } from "../../utils/apiConfig";

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    images.forEach((image, index) => {
      formData.append(`images`, image);
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
      setTitle("");
      setContent("");
      setImages([]);
      onClose();
    } catch (error) {
      setErrorMessage("Error creating post");
    }
  };

  const handleImageChange = (e) => {
    setImages([...images, ...Array.from(e.target.files)]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create a New Post</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows="4"
            required
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />

            <div className="image-previews">
              {images.map((image, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                  />
                  <button type="button" onClick={() => removeImage(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Post</button>
          </div>
          {errorMessage && <p className="error"> {errorMessage} </p>}
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
