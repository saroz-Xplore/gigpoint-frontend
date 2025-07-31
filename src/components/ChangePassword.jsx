import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BASE_URL;

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}auth/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (res.ok) {
        setMessage("Password changed successfully!");
        setSuccess(true);
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const error = await res.json();
        setMessage(error.message || "Failed to update password.");
      }
    } catch (err) {
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-md border">
      <button
        className="mb-4 flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-600 text-xl transition-colors duration-200 hover:bg-blue-600 hover:text-white"
        onClick={() => navigate("/update-profile")}
        aria-label="Back"
      >
        <FaArrowLeft />
      </button>

      <h2 className="text-xl font-bold mb-4 text-center">Change Password</h2>

      {message && (
        <p className={`mb-4 text-center ${success ? "text-green-600" : "text-blue-600"}`}>
          {message}
        </p>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <input
              type={showPassword.current ? "text" : "password"}
              name="currentPassword"
              placeholder="Current Password"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleVisibility("current")}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword.new ? "text" : "password"}
              name="newPassword"
              placeholder="New Password"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleVisibility("new")}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

      
          <div className="relative">
            <input
              type={showPassword.confirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleVisibility("confirm")}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            Update Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;
