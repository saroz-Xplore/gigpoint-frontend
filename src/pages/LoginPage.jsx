import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaTools } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignup = () => {
    window.location.href = "https://accounts.google.com/signup";
  };

  const handleWorkerLogin = () => {
    navigate("/worker-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-800 flex items-center justify-center px-4">
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
                  <button
                    onClick={() => setRole("user")}
                    className="w-24 h-24 rounded-full border-4 border-blue-500 text-blue-600 flex items-center justify-center text-4xl shadow-lg hover:shadow-blue-500/50 transition-transform duration-300 hover:scale-110"
                  >
                    <FaUser />
                  </button>
                  <span className="mt-2 text-sm font-semibold text-gray-700">User</span>
                </div>

                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setRole("worker")}
                    className="w-24 h-24 rounded-full border-4 border-blue-500 text-blue-600 flex items-center justify-center text-4xl shadow-lg hover:shadow-blue-500/50 transition-transform duration-300 hover:scale-110"
                  >
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
              <button
                onClick={handleGoogleSignup}
                className="w-full bg-white border-2 border-blue-600 text-blue-600 font-semibold py-2 rounded-full flex items-center justify-center gap-2 hover:bg-blue-50 transition"
              >
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
                className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={handleWorkerLogin}
                className="w-full bg-blue-700 text-white py-2 rounded-full hover:bg-blue-800 transition font-semibold mb-4"
              >
                Login
              </button>

              <p className="text-center text-sm text-gray-600">
                No account?{" "}
                <span
                  className="text-blue-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => alert("Redirect to signup page")}
                >
                  Sign up
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
