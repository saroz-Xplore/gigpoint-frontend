import React, { useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_BASE_URL;

const WorkerDashboard = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [worker, setWorker] = useState(null);
  const [activeTab, setActiveTab] = useState("settings");
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [userRes, jobsRes] = await Promise.all([
          fetch(`${backendUrl}my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}jobs/searching`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const userData = await userRes.json();
        const jobData = await jobsRes.json();

        setWorker(userData.data);
        setServiceRequests(jobData.data);
        setIsAvailable(userData.data?.isAvailable || false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const handleAvailabilityToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${backendUrl}workers/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });

      if (response.ok) {
        setIsAvailable(!isAvailable);
      }
    } catch (err) {
      console.error("Error updating availability:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "ratings":
        return (
          <section className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">Ratings</h3>
            <p className="text-gray-600">Your ratings will appear here.</p>
          </section>
        );
      case "settings":
      default:
        return (
          <>
            {/* Suggested Work */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-800">Suggested Work</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceRequests.map((job) => (
                  <div key={job._id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <i className="fas fa-briefcase text-blue-600"></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800">{job.title}</h4>
                        <p className="text-xs text-blue-600">{new Date(job.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{job.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      <strong>Price:</strong> ₹{job.priceRange.initial} - ₹{job.priceRange.end}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Skills:</strong> {job.skills.join(", ")}
                    </p>
                    <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 flex-col">
        <div className="p-6 border-b border-blue-200 text-center relative">
          <img
            className="w-24 h-24 rounded-full border-4 border-white shadow-md mx-auto mb-2"
            src={worker?.avatar || ""}
            alt="Profile"
          />

          <div className="absolute left-1/2 transform -translate-x-1/2 mt-2">
            <button
              onClick={handleAvailabilityToggle}
              className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${
                isAvailable ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  isAvailable ? "translate-x-6" : "translate-x-1"
                }`}
              ></span>
            </button>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-blue-900">{worker?.name || "Loading..."}</h2>
          <p className="text-sm text-blue-700 capitalize">{worker?.profession || worker?.role}</p>
          <div className="mt-2 text-xs text-blue-600">
            {isAvailable ? "Available for work" : "Not available"}
          </div>
          <div className="mt-4 text-sm text-blue-800 space-y-2">
            <div><i className="fas fa-envelope mr-2"></i>{worker?.email}</div>
            <div><i className="fas fa-phone mr-2"></i>{worker?.phone || "N/A"}</div>
            <div><i className="fas fa-map-marker-alt mr-2"></i>{worker?.location || "Your City"}</div>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {[
            { icon: "fa-cog", label: "Suggested Work", tab: "settings" },
            { icon: "fa-star", label: "Ratings", tab: "ratings" },
          ].map(({ icon, label, tab }, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center px-4 py-3 w-full text-left rounded-lg ${
                activeTab === tab ? "bg-blue-200 text-blue-800" : "text-blue-800 hover:bg-blue-100"
              }`}
            >
              <i className={`fas ${icon} mr-3`}></i> {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
          <button className="p-2">
            <i className="fas fa-bars"></i>
          </button>
          <div className="flex items-center space-x-2">
            <img
              className="w-8 h-8 rounded-full border-2 border-white"
              src={worker?.avatar || ""}
              alt="Profile"
            />
            <span className="font-medium">{worker?.name || "..."}</span>
          </div>
          <div className="w-8 flex justify-end">
            <button
              onClick={handleAvailabilityToggle}
              className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 focus:outline-none ${
                isAvailable ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                  isAvailable ? "translate-x-6" : "translate-x-1"
                }`}
              ></span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden flex border-b bg-white">
          {[
            { icon: "fa-cog", label: "Suggested Work", tab: "settings" },
            { icon: "fa-star", label: "Ratings", tab: "ratings" },
          ].map(({ icon, label, tab }, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              <i className={`fas ${icon} mr-2`}></i>
              {label}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-800 mb-2 hidden md:block">
              Welcome back, {worker?.name || "..."}
            </h2>
            <p className="text-blue-600 mb-6 hidden md:block">
              Here's what's happening with your work today.
            </p>

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkerDashboard;
