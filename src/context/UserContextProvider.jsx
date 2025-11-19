import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BASE_URL;

  // Try to get user from localStorage first
  const getUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('userData');
      const storedTimestamp = localStorage.getItem('userDataTimestamp');
      
      if (storedUser && storedTimestamp) {
        const timestamp = parseInt(storedTimestamp);
        const now = Date.now();
        // Use cached data if it's less than 5 minutes old
        if (now - timestamp < 5 * 60 * 1000) {
          return JSON.parse(storedUser);
        }
      }
    } catch (error) {
      console.error("Error reading user from storage:", error);
    }
    return null;
  };

  const storeUserInStorage = (userData) => {
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('userDataTimestamp', Date.now().toString());
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  const fetchUser = async () => {
    try {
      // Set cached user immediately for faster UI
      const cachedUser = getUserFromStorage();
      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false); // Show UI immediately with cached data
      }

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
          localStorage.removeItem('userData');
          localStorage.removeItem('userDataTimestamp');
          return;
        }
      }

      let userData = null;
      if (data?.data?.userLogin) {
        userData = { ...data.data.userLogin, role: data.data.userLogin.role || "user" };
      } else if (data?.data?.Worker) {
        userData = { ...data.data.Worker, role: "worker" };
      } else if (data?.data?.User) {
        userData = { ...data.data.User, role: "user" };
      }

      if (userData) {
        setUser(userData);
        storeUserInStorage(userData);
      } else {
        setUser(null);
        localStorage.removeItem('userData');
        localStorage.removeItem('userDataTimestamp');
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      // Don't clear user on network errors, use cached data if available
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
export default UserContextProvider;