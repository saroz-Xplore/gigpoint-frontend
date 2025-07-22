import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContextProvider.jsx";

const OAuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    const processOAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        localStorage.setItem("accessToken", token);

        try {
   
          const response = await fetch("http://localhost:3000/api/v1/auth/my", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          console.log("Fetched user data:", data);

          if (response.ok) {
            setUser({ fullName: data.fullName || "User" });  
            navigate("/user-dashboard");
          } else {
            navigate("/login");
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          navigate("/login");
        }

      } else {
        navigate("/login");
      }
    };

    processOAuth();
  }, [location, navigate, setUser]);

  return <p className="text-center mt-20">Logging you in...</p>;
};

export default OAuthHandler;
