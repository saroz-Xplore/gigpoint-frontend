import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LifeSidebar";

const backendUrl = import.meta.env.VITE_BASE_URL;

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
   

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${backendUrl}auth/my`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/login");
          return;
        }

        const data = await res.json();
        const userData = data.data.User; 
        setUser({
          ...userData,
          joinedOn: data.data.JoinedOn,
          jobPosted: data.data.JobPosted,
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LeftSidebar worker={user} workinfo={user} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">
            Welcome to Your Dashboard, {user?.fullName || "User"}!
          </h1>
          <p className="text-gray-600 mb-6">
            This is your personal dashboard. Manage your account and explore
            features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Profile</h3>
              <p className="text-sm text-gray-600 mb-3">
                View and edit your personal information
              </p>
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                onClick={() => navigate("/profile")}
              >
                Manage Profile
              </button>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Settings</h3>
              <p className="text-sm text-gray-600 mb-3">
                Configure your account preferences
              </p>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition"
                onClick={() => navigate("/settings")}
              >
                Account Settings
              </button>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Activities</h3>
              <p className="text-sm text-gray-600 mb-3">
                View your recent activities
              </p>
              <button
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition"
                onClick={() => navigate("/activities")}
              >
                View Activities
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
