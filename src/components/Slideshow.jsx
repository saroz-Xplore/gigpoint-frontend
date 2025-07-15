import React, { useState, useEffect } from "react";

const Slideshow = () => {
  const images = ["/carpenter.jpeg", "/cleaner.jpg", "/electrician.jpg", "/plumber.jpg"]; // Images in public folder
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2500); // Change slide every 2.5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full max-h-96 rounded-xl overflow-hidden shadow-lg">
      <img
        src={images[currentIndex]}
        alt="Slideshow"
        className="w-full h-full object-cover transition duration-500"
      />
    </div>
  );
};

export default Slideshow;
