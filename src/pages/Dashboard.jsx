import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Please login to continue</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mb-2">
          Login
        </button>

        <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
          Sign Up
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Not registered? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
