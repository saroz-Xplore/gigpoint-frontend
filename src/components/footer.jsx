import React from 'react';
import { FaTools, FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowUp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 font-sans text-sm">
      <div className="container mx-auto px-4">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">

          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex justify-center md:justify-start items-center">
              <FaTools className="mr-2 text-blue-600" /> GigPoint
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Get your jobs done hiring skilled workers according to your choice. Serving since 2025.
            </p>
          </div>

          {/* Services Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Services</h3>
            <ul className="space-y-1">
              {['Plumbing', 'Electrical', 'Carpentry', 'Cleaning'].map((service, idx) => (
                <li key={idx}>
                  <a href="#" className="text-gray-400 hover:text-white">{service}</a>
                </li>
              ))}
              
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <p className="text-gray-400 mb-1 flex justify-center md:justify-start items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-600" /> Kathmandu, Nepal
            </p>
            <p className="text-gray-400 mb-1 flex justify-center md:justify-start items-center">
              <FaPhone className="mr-2 text-blue-600" /> 9865383705
            </p>
            <p className="text-gray-400 mb-1 flex justify-center md:justify-start items-center">
              <FaEnvelope className="mr-2 text-blue-600" /> gigpoint@mail.com
            </p>
          </div>

          {/* Developer Section */}
          <div className="flex justify-center space-x-6">
            {[
              { name: 'Saroj Simkhada', role: 'Frontend Developer', img: '/saroj.jpg' },
              { name: 'Ayush Pandey', role: 'Backend Developer', img: '/ayush.jpg' },
            ].map((dev, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={dev.img}
                  alt={dev.name}
                  className="w-20 h-20 rounded-full mb-1 object-cover"
                />
                <span className="text-sm font-medium">{dev.name}</span>
                <span className="text-xs text-blue-500">{dev.role}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-gray-400 relative">
          <p>&copy; {new Date().getFullYear()} GigPoint. All rights reserved.</p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed right-4 bottom-4 p-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xl"
          >
            <FaArrowUp />
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
