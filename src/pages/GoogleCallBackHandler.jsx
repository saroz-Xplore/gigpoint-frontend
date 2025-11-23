import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContextProvider.jsx";

const GoogleCallBackHandler = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [error, setError] = useState("");
  const backendUrl = import.meta.env.VITE_BASE_URL; // ADD THIS LINE

  useEffect(() => {
    const handleRoleConflict = (message) => {
      if (
        message.includes("Service Provider") ||
        message.includes("worker") ||
        message.includes("already registered as a worker") ||
        message.includes("already registered as a Service Provider")
      ) {
        localStorage.clear();
        setError(
          "This Google account is already registered as a Service Provider. Please use email/password login instead."
        );

        setTimeout(() => {
          navigate("/login?role=worker");
        }, 4000);
        return true;
      }
      return false;
    };

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const errorMessage = params.get("error");

    // Handle OAuth errors from backend redirect
    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));

      if (handleRoleConflict(errorMessage)) {
        return;
      } else {
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
      return;
    }

    // If we have tokens, proceed with user fetch
    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("isLoggedIn", "true");

      const fetchUser = async () => {
        try {
          const res = await fetch(`${backendUrl}auth/my`, {
            credentials: "include",
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const data = await res.json();
            console.log("User data from backend:", data); // Debug log

            // FIX: Handle different response structures
            let userData = null;
            if (data?.data?.userLogin) {
              userData = {
                ...data.data.userLogin,
                role: data.data.userLogin.role || "user",
              };
            } else if (data?.data?.User) {
              userData = { ...data.data.User, role: "user" };
            } else if (data?.data?.user) {
              userData = { ...data.data.user, role: "user" };
            }

            if (userData) {
              setUser(userData);

              // Redirect based on role - FIXED PATH
              if (userData.role === "worker") {
                navigate("/worker-dashboard");
              } else if (userData.role === "admin") {
                navigate("/admin");
              } else {
                navigate("/user-dashboard"); // Changed from "/dashboard" to "/user-dashboard"
              }
            } else {
              throw new Error("User data not found in response");
            }
          } else {
            const errorData = await res.json();
            if (handleRoleConflict(errorData.message)) {
              return;
            }
            navigate("/login");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setError("Network error. Please try again.");
          setTimeout(() => navigate("/login"), 3000);
        }
      };

      fetchUser();
    } else {
      // If no tokens and no error, something went wrong
      setError("Authentication failed. Please try again.");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [navigate, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Account Conflict
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700 text-lg">Logging in, please wait...</p>
      </div>
    </div>
  );
};

export default GoogleCallBackHandler;
