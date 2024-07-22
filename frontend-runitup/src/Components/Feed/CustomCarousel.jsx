import React, { useState, useEffect } from "react";
import "../../styles/CustomCarousel.css";

const CustomCarousel = ({ images, autoSlideInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleNext();
    }, autoSlideInterval);

    return () => clearInterval(intervalId);
  }, [currentIndex, autoSlideInterval]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="carousel-container">
      <button className="carousel-button prev" onClick={handlePrev}>
        &#9664;
      </button>
      <div className="carousel-images">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="carousel-image"
        />
      </div>
      <button className="carousel-button next" onClick={handleNext}>
        &#9654;
      </button>
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <div
            key={index}
            className={`indicator ${currentIndex === index ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomCarousel;
