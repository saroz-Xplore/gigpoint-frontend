import React, { useEffect, useState } from "react";
import { FaBriefcase } from "react-icons/fa";
const backendUrl = import.meta.env.VITE_BASE_URL;

const WorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [recommendedWorks, setRecommendedWorks] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true); 
  const [workinfo , setWorkInfo] =useState(null)

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        const res = await fetch(`${backendUrl}auth/my`, {
          credentials: "include",
        });
        const userData = await res.json();
        setWorker(userData.data.Worker);
        setWorkInfo(userData.data)
        if (userData.data?.isAvailable !== undefined) {
          setIsAvailable(userData.data.isAvailable);
        }
      } catch (err) {
        console.error("Error fetching worker profile:", err);
      }
    };

    const fetchRecommendedWorks = async () => {
      try {
        const res = await fetch(`${backendUrl}job/recomend`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendedWorks(data?.works || []);
        } else {
          setRecommendedWorks([]);
        }
      } catch (err) {
        console.error("Error fetching recommended works:", err);
        setRecommendedWorks([]);
      } finally {
        setLoadingWorks(false);
      }
    };

    fetchWorkerProfile();
    fetchRecommendedWorks();
  }, []);

  const handleWorkClick = (work) => {
    alert(`You clicked on: ${work.title}`);
  };

  const toggleAvailability = async () => {
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);

 
    try {
      await fetch(`${backendUrl}auth/available`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isAvailable: newStatus }),
      });
    } catch (err) {
      console.error("Error updating availability:", err);
    }
  };


  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <aside className="bg-gradient-to-br from-blue-50 to-blue-100 w-full md:w-72 h-auto md:h-screen p-5 md:p-6 border-b md:border-b-0 md:border-r border-blue-200 flex flex-col space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="relative mb-3">
            <img
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              src={worker?.profilePicture || "/default-avatar.png"}
              alt="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-avatar.png";
              }}
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div
                className={`p-1 rounded-full ${
                  isAvailable ? "bg-green-400" : "bg-gray-300"
                } border-2 border-white`}
              >
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-blue-900 mb-1 px-2 py-1 rounded-md max-w-full truncate">
            {worker?.fullName || "Loading..."}
          </h2>
          <p
            className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 capitalize"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            {worker?.profession || worker?.role || "Professional"}
          </p>

          <div className="w-full bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium text-blue-800"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                Availability
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={toggleAvailability}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="flex items-center mb-3 pb-2 border-b border-blue-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-blue-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h2
              className="text-md font-semibold text-blue-900"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              Profile Details
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-blue-500 font-medium">Email</p>
                <p className="text-sm text-blue-800">
                  {worker?.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-blue-500 font-medium">Phone</p>
                <p className="text-sm text-blue-800">
                  {worker?.phoneNo || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-blue-500 font-medium">Address</p>
                <p className="text-sm text-blue-800">
                  {worker?.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Info Card - Without Rating */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden transition-all duration-200">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-full flex items-center justify-between p-4 text-blue-900 hover:bg-blue-50 transition-colors`}
          >
            <div className="flex items-center">
              <div className="p-2 mr-3 rounded-lg bg-blue-100 text-blue-600">
                <FaBriefcase className="text-current" />
              </div>
              <span
                className="font-medium"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                Work Statistics
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 text-blue-400 transform transition-transform ${
                showSettings ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {showSettings && (
            <div className="px-4 pb-4 pt-2 border-t border-blue-100">
              {/* Stats Grid - Only Completed and Applied */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg text-center flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    Completed
                  </p>
                  <p className="text-xl font-bold text-blue-900 leading-tight">
                    {workinfo?.jobDone || 0}
                  </p>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-center flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    Applied
                  </p>
                  <p className="text-xl font-bold text-blue-900 leading-tight">
                    {workinfo?.jobApplied || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">
        {isAvailable ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-blue-900">
              Recommended Works
            </h1>
            {loadingWorks ? (
              <p className="text-gray-500">Loading recommended works...</p>
            ) : recommendedWorks.length === 0 ? (
              <p className="text-gray-500">No recommended works available.</p>
            ) : (
              <ul className="space-y-4">
                {recommendedWorks.map((work) => (
                  <li
                    key={work.id}
                    onClick={() => handleWorkClick(work)}
                    className="cursor-pointer p-4 bg-white rounded shadow hover:bg-blue-50 transition"
                  >
                    <h2 className="text-lg font-semibold text-blue-800">
                      {work.title}
                    </h2>
                    <p className="text-gray-600">{work.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <p>
              You are currently unavailable. Turn on availability to see
              recommended works.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
