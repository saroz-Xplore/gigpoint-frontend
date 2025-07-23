import React, { useState } from "react";
import { FaEnvelope, FaKey, FaLock } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");


  const showSuccess = (msg) => toast.success(msg);
  const showError = (msg) => toast.error(msg);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:3000/api/v1/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showSuccess("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      showError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:3000/api/v1/auth/verifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showSuccess("OTP Verified. Proceed to reset password.");
      setStep(3);
    } catch (err) {
      showError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (newPassword !== confirmPassword) {
    showError("Passwords do not match");
    setLoading(false);
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:3000/api/v1/auth/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }), // Only newPassword is sent
    });

    if (!res.ok) throw new Error((await res.json()).message);

    showSuccess("Password successfully reset!");
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (err) {
    showError(err.message || "Failed to reset password");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <ToastContainer position="top-right" />
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-blue-200">
        <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
          {step === 1 && <FaEnvelope />}
          {step === 2 && <FaKey />}
          {step === 3 && <FaLock />}
          {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Reset Password"}
        </h2>

        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <label className="block">
              <span className="text-gray-700">Email Address</span>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring focus:ring-blue-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <label className="block">
              <span className="text-gray-700">Enter OTP</span>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring focus:ring-blue-300"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-center text-blue-600 underline"
            >
              Back to Email
            </button>
          </form>
        )}
{step === 3 && (
  <form onSubmit={handleResetPassword} className="space-y-4">
    <label className="block">
      <span className="text-gray-700">New Password</span>
      <input
        type="password"
        required
        minLength={6}
        className="mt-1 block w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring focus:ring-blue-300"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Enter new password"
      />
    </label>

    <label className="block">
      <span className="text-gray-700">Confirm Password</span>
      <input
        type="password"
        required
        minLength={6}
        className="mt-1 block w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring focus:ring-blue-300"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
      />
    </label>

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "Resetting..." : "Reset Password"}
    </button>

    <button
      type="button"
      onClick={() => setStep(2)}
      className="w-full text-center text-blue-600 underline"
    >
      Back to OTP Verification
    </button>
  </form>
)}

        
      </div>
    </div>
  );
};

export default ForgotPassword;
