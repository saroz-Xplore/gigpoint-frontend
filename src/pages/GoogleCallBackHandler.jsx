import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContextProvider.jsx";

const GoogleCallBackHandler = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/v1/auth/my", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();

          const user = data.data.userLogin || data.data;
          setUser({ ...user, role: user.role || "user" });

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
