import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-t from-blue-300 via-white to-blue-200 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-blue-600 font-serif">
          To view your dashboard
        </h2>

        <p className="text-gray-700 mb-6">
          Please login or create an account to continue
        </p>

        <button
          onClick={() => navigate("/login")}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold shadow transition cursor-pointer"
        >
          Go to Login Page
        </button>

        <p className="mt-4 text-gray-600 text-sm">
          Don't have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
