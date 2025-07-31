import React, { useState } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
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
    <div className="max-w-md mx-auto mt-10 mb-8 p-8 bg-white rounded-xl shadow-xl border border-blue-700 text-center">
      
      {success ? (
        <div className="animate-fadeIn flex flex-col items-center gap-3 p-6 bg-green-50 border border-green-300 rounded-xl shadow-md">
          <FaCheckCircle className="text-blue-600 text-5xl animate-bounce" />
          <h2 className="text-xl font-bold text-blue-700">{message}</h2>
          <p className="text-blue-600 text-sm">You can now log in with your new password.</p>
          <button
            onClick={() => navigate("/worker-dashboard")}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md transition cursor-pointer"
          >
            Go to dashboard
          </button>
        </div>
      ) : (
        <>
          <button
            className="mb-6 flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-600 text-xl transition-colors duration-200 hover:bg-blue-600 hover:text-white cursor-pointer"
            onClick={() => navigate("/update-profile")}
            aria-label="Back"
          >
            <FaArrowLeft />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-blue-600">Change Password</h2>

          {message && (
            <p className="mb-4 text-center text-blue-600">{message}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: "currentPassword", label: "Current Password", field: "current" },
              { name: "newPassword", label: "New Password", field: "new" },
              { name: "confirmPassword", label: "Confirm New Password", field: "confirm" },
            ].map(({ name, label, field }) => (
              <div key={name} className="relative">
                <input
                  type={showPassword[field] ? "text" : "password"}
                  name={name}
                  placeholder={label}
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full p-2 border border-blue-300 rounded-md pr-10 focus:ring-1 focus:ring-blue-400 focus:outline-none text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility(field)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword[field] ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition shadow-md cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChangePassword;
