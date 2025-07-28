import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContextProvider.jsx";

const backendUrl = import.meta.env.VITE_BASE_URL
console.log(backendUrl);

const OAuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useUser();

  fetch(`${backendUrl}auth/my`, {
  credentials: "include",
})
  .then((res) => res.json())
  .then((data) => {
    if (data?.data) {
      setUser({ fullName: data.data.fullName || "User" });
      navigate("/user-dashboard");
    } else {
      navigate("/login");
    }
  })
  .catch(() => navigate("/login"));

  return <p className="text-center mt-20">Logging you in...</p>;
};

export default OAuthHandler;
