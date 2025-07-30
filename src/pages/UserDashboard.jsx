import { useState, useEffect, useRef } from "react";

const backendUrl = import.meta.env.VITE_BASE_URL

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [workers, setWorkers] = useState([]);
  const dropdownRef = useRef();

  useEffect(() => {
  fetch(`${backendUrl}auth/my`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => setUser(data.data))
    .catch(() => setUser(null));

  fetch(`${backendUrl}workers?page=1&perPage=10`, {
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => setWorkers(data.data.result || []))
    .catch(() => setWorkers([]));
}, []);

  const handleApplyHire = (worker) => {
    alert(`You applied to hire ${worker.fullName}. Contact: ${worker.phoneNo || "N/A"}`);
  };

  const handleLogout = () => {
  fetch(`${backendUrl}auth/logout`, {
    method: "POST",
    credentials: "include",
  })
    .then(() => setUser(null))
    .finally(() => navigate("/login"));
};

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-white w-full md:w-72 p-6 shadow-md flex flex-col items-center md:items-start sticky top-0">
        {user ? (
          <>
            <img
              src={user.profilePicture || "https://via.placeholder.com/100"}
              alt="User"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <h2 className="text-xl font-semibold mb-1 text-center md:text-left">{user.fullName || "User"}</h2>
            <p className="text-gray-600 mb-1 text-center md:text-left break-all">{user.email || "No email"}</p>
            <p className="text-gray-600 mb-1 text-center md:text-left">{user.phoneNo || "No phone number"}</p>
            <p className="text-gray-600 mb-1 capitalize text-center md:text-left">{user.role || "User"}</p>
            <p className="text-gray-600 text-center md:text-left">{user.address || "No address provided"}</p>
            <button
              onClick={handleLogout}
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
            >
              Logout
            </button>
          </>
        ) : (
          <p>Loading user info...</p>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Available Workers</h1>
        </div>

        {/* Workers list */}
        {workers.length === 0 ? (
          <p className="text-gray-600">No workers found.</p>
        ) : (
          <div className="space-y-6">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between"
              >
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <img
                    src={worker.profilePicture || "https://via.placeholder.com/80"}
                    alt={worker.fullName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{worker.fullName}</h3>
                    <p className="text-gray-600 capitalize">{worker.role}</p>
                    <p className="text-gray-500 text-sm">
                      Skills: {worker.skills?.length > 0 ? worker.skills.join(", ") : "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm">Experience: {worker.experienceYear || "N/A"} years</p>
                    <p className="text-gray-500 text-sm">Location: {worker.address || "N/A"}</p>
                    <p className={`text-sm font-semibold ${worker.isAvailable ? "text-green-600" : "text-red-600"}`}>
                      {worker.isAvailable ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleApplyHire(worker)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 self-start sm:self-auto"
                >
                  Apply / Hire
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
