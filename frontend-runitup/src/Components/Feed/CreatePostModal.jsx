import React, { useState } from "react";
import "../../styles/CreateModal.css";

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, content, images });
    setTitle("");
    setContent("");
    setImages([]);
    onClose();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
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
          {images.length > 0 && (
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
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
