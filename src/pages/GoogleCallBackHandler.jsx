import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContextProvider.jsx";

const backendUrl = import.meta.env.VITE_BASE_URL


const GoogleCallbackHandler = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  fetch(`${backendUrl}auth/my`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  }
})
  .then((res) => res.json())
  .then((data) => {
    if (data?.data) {
      setUser({ fullName: data.data.userLogin.fullName || "User" });
      navigate("/user-dashboard");
    } else {
      navigate("/login");
    }
  })
  .catch(() => navigate("/login"));

  return <p>Logging you in...</p>;
};

export default GoogleCallbackHandler;
