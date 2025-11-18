import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BASE_URL;

  const fetchUser = async () => {
  try {
    let res = await fetch(`${backendUrl}auth/my`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    let data = await res.json();

    // If 401, try refreshing token
    if (!res.ok && res.status === 401) {
      const refreshRes = await fetch(`${backendUrl}auth/accessToken`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        res = await fetch(`${backendUrl}auth/my`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        data = await res.json();
      } else {
        setUser(null);
        return;
      }
    }

    if (data?.data?.userLogin) {
      setUser({ ...data.data.userLogin, role: data.data.userLogin.role || "user" });
    } else if (data?.data?.Worker) {
      setUser({ ...data.data.Worker, role: "worker" });
    } else {
      setUser(null);
    }
  } catch (err) {
    console.error("Error fetching user:", err);
    setUser(null);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export default UserContextProvider;
