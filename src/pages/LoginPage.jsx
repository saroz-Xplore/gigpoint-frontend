import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaTools } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useUser } from "../context/UserContextProvider.jsx";

const LoginPage = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    if (roleParam === "worker") setRole("worker");
    else if (roleParam === "user") setRole("user");
  }, [location]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:3000/api/v1/oauth/google";
  };

  const handleWorkerLogin = async () => {
    let errors = {};

    if (!email) errors.email = "Email is required";
    else if (!validateEmail(email)) errors.email = "Invalid email address";

    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";

    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch('http://localhost:3000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();

        if (response.ok) {
          // Still using localStorage here; you can adapt this to your context setup if needed
          localStorage.setItem("accessToken", data.data.accessToken);
          setUser({ fullName: data.data.fullName || "Worker", role: "worker" }); 
          navigate("/worker-dashboard");
        } else {
          setErrors({ password: data.message || "Login failed" });
        }
      } catch (error) {
        console.error("Network error:", error);
        setErrors({ password: "Something went wrong. Please try again." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-blue-300 via-white to-blue-200 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-4">
          <h2 className="text-2xl font-bold text-center text-white">Welcome to Gigpoint</h2>
        </div>

        <div className="p-6">
          {!role && (
            <>
              <p className="text-center font-medium text-gray-700 mb-6">Select Your Role</p>
              <div className="flex justify-center gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <button onClick={() => setRole("user")} className="w-24 h-24 rounded-full border-4 border-blue-500 text-blue-600 flex items-center justify-center text-4xl shadow-lg">
                    <FaUser />
                  </button>
                  <span className="mt-2 text-sm font-semibold text-gray-700">User</span>
                </div>
                <div className="flex flex-col items-center">
                  <button onClick={() => setRole("worker")} className="w-24 h-24 rounded-full border-4 border-blue-500 text-blue-600 flex items-center justify-center text-4xl shadow-lg">
                    <FaTools />
                  </button>
                  <span className="mt-2 text-sm font-semibold text-gray-700">Worker</span>
                </div>
              </div>
            </>
          )}

          {role === "user" && (
            <>
              <p className="text-center mb-4 font-semibold capitalize text-blue-600">
                Login with Google as {role}
              </p>
              <button onClick={handleGoogleSignup} className="w-full bg-white border-2 border-blue-600 text-blue-600 font-semibold py-2 rounded-full flex items-center justify-center gap-2">
                <FcGoogle className="text-2xl" />
                Login with Google
              </button>
            </>
          )}

          {role === "worker" && (
            <>
              <p className="text-center mb-4 font-semibold capitalize text-blue-600">
                Login as Worker
              </p>

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full mb-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mb-2">{errors.email}</p>}

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full mb-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
                }`}
              />
              {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

              <button
                onClick={handleWorkerLogin}
                className="w-full bg-blue-700 text-white py-2 rounded-full hover:bg-blue-800 transition font-semibold mb-2"
              >
                Login
              </button>

              <p
                onClick={() => navigate("/forgot-password")}
                className="text-center text-xs text-blue-600 cursor-pointer hover:underline mb-4"
              >
                Forgot Password?
              </p>

              <p className="text-center text-xs text-gray-500 mt-1">
                Don't have an account?{" "}
                <span
                  onClick={() => navigate("/worker-signup")}
                  className="text-blue-600 font-semibold cursor-pointer hover:underline"
                >
                  Sign Up here
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
