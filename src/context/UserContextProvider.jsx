import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    fetch("http://localhost:3000/api/v1/auth/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        console.log("User API Response:", data);

        if (data?.data) {
          setUser(data.data);   // ✅ Set the logged-in user
        } else {
          localStorage.removeItem("accessToken");
          setUser(null);        // ✅ Clear session on failure
        }
      })
      .catch(() => {
        localStorage.removeItem("accessToken");
        setUser(null);
      })
      .finally(() => setLoading(false));  // ✅ Important to unblock ProtectedRoute
  } else {
    setLoading(false);  // ✅ No token → stop loading
  }
}, []);


  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
export default UserContextProvider

export const useUser = () => useContext(UserContext);
