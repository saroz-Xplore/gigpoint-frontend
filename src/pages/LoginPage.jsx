import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaTools, FaLock, FaEnvelope } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useUser } from "../context/UserContextProvider.jsx";

const backendUrl = import.meta.env.VITE_BASE_URL;

const LoginPage = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
    window.location.href = `${backendUrl}oauth/google`;
  };

  const handleRoleConflictError = (errorMessage) => {
    if (
      errorMessage.includes("already exists as a worker") ||
      errorMessage.includes("already exists as a user") ||
      errorMessage.includes("role conflict") ||
      errorMessage.includes("already registered")
    ) {
      // Clear local storage and state
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);

      // Show appropriate error message
      setErrors({
        general:
          "Account role conflict. Please use the correct login method for your account type.",
      });

      // Redirect to login after a delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);

      return true;
    }
    return false;
  };

  const handleWorkerLogin = async () => {
    let errors = {};
    setErrors({});
    setIsLoading(true);

    if (!email) errors.email = "Email is required";
    else if (!validateEmail(email)) errors.email = "Invalid email address";

    if (!password) errors.password = "Password is required";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters";

    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch(`${backendUrl}auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.data) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("refreshToken", data.data.refreshToken);

          const userData = data.data.userLogin;

          if (userData.role === "admin") {
             
            setUser({
              ...userData,
              fullName: userData.fullName,
              role: userData.role,
            });
            navigate("/admin");
            return;
          }
          // Check if the logged-in user matches the expected role
          if (role === "worker" && userData.role !== "worker") {
            setErrors({
              general:
                "This email is registered as a homeowner. Please use Google login instead.",
            });
            localStorage.clear();
            return;
          }

          if (role === "user" && userData.role !== "user") {
            setErrors({
              general:
                "This email is registered as a service provider. Please use email/password login instead.",
            });
            localStorage.clear();
            return;
          }

          // Set user from backend response
          setUser({
            ...userData,
            fullName: userData.fullName,
            role: userData.role,
          });
          console.log(userData)
          // Redirect based on role
          if (userData.role === "worker") {
            navigate("/worker-dashboard");
          } else if (userData.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/user-dashboard");
          }
        } else {
          // Handle role conflict and other errors
          if (data.message && handleRoleConflictError(data.message)) {
            return;
          }
          setErrors({ general: data.message || "Login failed" });
        }
      } catch (error) {
        console.error("Network error:", error);
        setErrors({ general: "Something went wrong. Please try again." });
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-400 p-8 text-white relative">
          <img
            src="https://images.unsplash.com/photo-1665072204431-b3ba11bd6d06?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Collaborative workspace"
            className="w-full h-full object-cover rounded-l-xl absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="relative z-10 h-full flex flex-col justify-center p-6">
            <h2 className="text-3xl font-bold mb-2">Welcome to Gigpoint</h2>
            <p className="text-blue-100">
              Connect with local service professionals. Fast, reliable, and
              hassle-free.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-600">Access your account</p>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-red-600 text-sm">{errors.general}</span>
                </div>
                <button
                  onClick={clearErrors}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
              {errors.general.includes("conflict") && (
                <p className="text-red-500 text-xs mt-2">
                  Redirecting to login page...
                </p>
              )}
            </div>
          )}

          {!role && (
            <div className="mb-8">
              <p className="text-center font-medium text-gray-700 mb-6">
                Continue as
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
                <button
                  onClick={() => {
                    setRole("user");
                    clearErrors();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <FaUser className="text-blue-600" />
                  <span className="font-medium text-gray-700">Homeowner</span>
                </button>
                <button
                  onClick={() => {
                    setRole("worker");
                    clearErrors();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  <FaTools className="text-blue-600" />
                  <span className="font-medium text-gray-700">
                    Service Provider
                  </span>
                </button>
              </div>
            </div>
          )}

          {role === "user" && (
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 mb-6">
                Homeowner Login
              </p>
              <button
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              >
                <FcGoogle className="text-xl" />
                <span className="font-medium">Continue with Google</span>
              </button>

              <div className="mt-4">
                <button
                  onClick={() => {
                    setRole("");
                    clearErrors();
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  ← Back to role selection
                </button>
              </div>
            </div>
          )}

          {role === "worker" && (
            <div>
              <p className="text-lg font-semibold text-gray-800 mb-6 text-center">
                Service Provider Login
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearErrors();
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-400"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearErrors();
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300 focus:ring-blue-400"
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                onClick={handleWorkerLogin}
                disabled={isLoading}
                className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold mb-4 cursor-pointer ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/worker-signup")}
                  className="text-blue-600 font-medium hover:underline cursor-pointer"
                >
                  Sign up here
                </button>
              </p>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setRole("");
                    clearErrors();
                  }}
                  className="text-blue-600 hover:underline text-sm"
                >
                  ← Back to role selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
