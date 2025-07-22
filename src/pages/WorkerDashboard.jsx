import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WorkerDashboard = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Worker Dashboard</h1>
      </header>

      {/* Rest of your dashboard content */}
      <main>
        {/* Your worker dashboard content here */}
        <p>Welcome to your dashboard!</p>
      </main>
    </div>
  );
};

export default WorkerDashboard;
