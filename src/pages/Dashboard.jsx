import React, { useState } from 'react';

const Dashboard = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignupClick = () => {
    if (!email.trim()) {
      setError("*Please enter an email");
    } else if (!validateEmail(email)) {
      setError("*Please enter a valid email");
    } else {
      setError("");
      window.location.href = "https://accounts.google.com/signup";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-blue-300 via-white to-blue-200 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 font-serif">
          Join GigPoint Now
        </h2>

        {/* Input and Button in Row */}
        <div className="flex items-center space-x-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`flex-1 px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-gray-50 text-blue-700 font-medium 
              ${error ? 'border-red-400 focus:ring-red-400' : 'border-blue-200 focus:ring-blue-300'}
            `}
          />

          <button
            onClick={handleSignupClick}
            className="bg-blue-400 hover:bg-blue-500 transition text-white px-5 py-3 rounded-lg font-semibold shadow"
          >
            Sign Up
          </button>
        </div>

        {error && (
          <p className="mt-3 text-red-500 font-medium text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
