import React, { useState, useEffect } from 'react';
import { FaTools, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowUp, FaWrench, FaBolt, FaHammer, FaBroom } from 'react-icons/fa';

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { name: 'Plumbing', icon: <FaWrench className="text-blue-600 mr-2" /> },
    { name: 'Electrical', icon: <FaBolt className="text-blue-600 mr-2" /> },
    { name: 'Carpentry', icon: <FaHammer className="text-blue-600 mr-2" /> },
    { name: 'Cleaning', icon: <FaBroom className="text-blue-600 mr-2" /> },
  ];

  return (
    <footer className="bg-gray-900 text-white py-10 font-sans text-sm">
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">

          <div>
            <h3 className="text-lg font-bold mb-3 flex justify-center md:justify-start items-center">
              <FaTools className="mr-2 text-blue-600" /> GigPoint
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Get your jobs done hiring skilled workers according to your choice. Serving since 2025.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Services</h3>
            <ul className="space-y-2">
              {services.map((service, idx) => (
                <li key={idx} className="flex items-center justify-center md:justify-start">
                  {service.icon}
                  <span className="text-gray-400 hover:text-white">{service.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <p className="text-gray-400 mb-1 flex justify-center md:justify-start items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-600" /> Kathmandu, Nepal
            </p>
            <p className="text-gray-400 mb-1 flex justify-center md:justify-start items-center">
              <FaPhone className="mr-2 text-blue-600" /> +977 9865383705 , 9863392758
            </p>
            <p className="text-gray-400 mb-1 flex justify-center md:justify-start items-center">
              <FaEnvelope className="mr-2 text-blue-600" /> gigpoint@mail.com
            </p>
          </div>

          <div className="flex justify-center space-x-6 text-gray-400  ">
            {[
              { name: 'Saroj Simkhada', role: 'Frontend Developer', img: '/saroj.jpg' },
              { name: 'Ayush Pandey', role: 'Backend Developer', img: '/ayush.jpg' },
            ].map((dev, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <img src={dev.img} alt={dev.name} className="w-16 h-16 rounded-full mb-1 object-cover" />
                <span className="text-sm font-medium">{dev.name}</span>
                <span className="text-xs text-blue-500">{dev.role}</span>
              </div>
            ))}
          </div>

        </div>

        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-gray-400 relative">
          <p>&copy; {new Date().getFullYear()} GigPoint. All rights reserved.</p>

          {showScrollTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed right-4 bottom-4 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xl shadow-lg"
            >
              <FaArrowUp />
            </button>
          )}
        </div>

      </div>
    </footer>
  );
};

export default Footer;
