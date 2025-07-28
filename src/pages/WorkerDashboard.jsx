import React, { useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_BASE_URL;

const WorkerDashboard = () => {
  const [worker, setWorker] = useState(null);

 useEffect(() => {
  const fetchWorkerProfile = async () => {
    try {
      const res = await fetch(`${backendUrl}auth/my`, {
        credentials: "include",
      });
      const userData = await res.json();
      setWorker(userData.data);
    } catch (err) {
      console.error("Error fetching worker profile:", err);
    }
  };
  fetchWorkerProfile();
}, []);

  return (
    <aside className="w-64 h-full bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex-col">
      <div className="p-6 border-b border-blue-200 text-center">
       
        <img
          className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto mb-2"
          src={worker?.profilePicture || ""}
          alt="Profile"
        />

        <h2 className="mt-4 text-lg font-semibold text-blue-900">
          {worker?.fullName || "Loading..."}
        </h2>
        <p className="text-sm text-blue-700 capitalize">
          {worker?.profession || worker?.role}
        </p>
        <div className="mt-4 text-sm text-blue-800 space-y-2">
          <div>
            <i className="fas fa-envelope mr-2"></i>
            {worker?.email}
          </div>
          <div>
            <i className="fas fa-phone mr-2"></i>
            {worker?.phoneNo || "N/A"}
          </div>
          
        </div>
      </div>
    </aside>
  );
};

export default WorkerDashboard;
