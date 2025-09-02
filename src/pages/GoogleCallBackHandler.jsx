import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "../context/UserContextProvider.jsx";

const GoogleCallBackHandler = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }


    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("/api/v1/auth/my", {
          credentials: "include",
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

      if (res.ok) {
            const data = await res.json();
            const user = data.data.User;  
            const userData = {
              ...user,
              fullName: user.fullName || user.name || "User",
              role: user.role || "user",
              joinedOn: data.data.JoinedOn,
              jobPosted: data.data.JobPosted
            };
            setUser(userData);
            navigate("/user-dashboard");
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700 text-lg">Logging in, please wait...</p>
    </div>
  );
};

export default GoogleCallBackHandler;
