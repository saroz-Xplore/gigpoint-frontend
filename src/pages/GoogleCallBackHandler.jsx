import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContextProvider.jsx";

const GoogleCallbackHandler = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const fullName = params.get("name");

    if (token && fullName) {
      localStorage.setItem("accessToken", token);
      setUser({ fullName, role: "user" });
      navigate("/user-dashboard");
    } else {
      navigate("/login");  
    }
  }, [location, navigate, setUser]);

  return <p>Logging you in...</p>;
};

export default GoogleCallbackHandler;
