import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import "../../styles/CustomCarousel.css";

const CustomCarousel = ({ images, autoSlideInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleNext();
    }, autoSlideInterval);

    return () => clearInterval(intervalId);
  }, [currentIndex, autoSlideInterval]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleImageClick = (image) => {
    setPreviewImage(image);
    setIsPreviewVisible(true);
  };

  const handlePreviewClose = () => {
    setIsPreviewVisible(false);
  };

  return (
    <div className="carousel-container">
      <div
        className="carousel-images"
        onClick={() => handleImageClick(images[currentIndex])}
      >
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="carousel-image"
        />
      </div>
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <div
            key={index}
            className={`indicator ${currentIndex === index ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
      <Modal
        visible={isPreviewVisible}
        footer={null}
        onCancel={handlePreviewClose}
      >
        <img src={previewImage} alt="Preview" style={{ width: "100%" }} />
      </Modal>
    </div>
  );
};

export default CustomCarousel;
