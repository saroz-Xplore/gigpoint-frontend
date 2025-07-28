import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_BASE_URL

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetch(`${backendUrl}auth/my`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data?.data) setUser(data.data);
      else setUser(null);
    })
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
}, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
export default UserContextProvider

export const useUser = () => useContext(UserContext);
