import React, { useEffect, useState } from "react";
import { FaBriefcase, FaCheck, FaFileAlt, FaRupeeSign } from "react-icons/fa";

const backendUrl = import.meta.env.VITE_BASE_URL;

const WorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [recommendedWorks, setRecommendedWorks] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [workinfo, setWorkInfo] = useState(null);

  const [applications, setApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [totalEarning, setTotalEarning] = useState(0);

  const openApplications = async (status) => {
    setSelectedStatus(status);
    setShowModal(true);

    if (
      (status === "applied" && (!workinfo?.jobApplied || workinfo.jobApplied.length === 0)) ||
      (status === "completed" && (!workinfo?.jobDone || workinfo.jobDone.length === 0))
    ) {
      setApplications([]);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}job/worker/get/application`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        let errorData = null;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: "Unknown error" };
        }

        if (res.status === 404 && errorData?.message?.includes("0 Applications")) {
          setApplications([]);
          return;
        }

        console.error("Error from backend:", errorData);
        setApplications([]);
        return;
      }

      const userData = await res.json();
      let apps = userData.data?.myApplications || [];

      if (status === "completed") {
        apps = apps.filter((a) => a.jobId?.status === "completed");
      } else if (status === "applied") {
        apps = apps.filter((a) => a.jobId?.status !== "pending");
      }

      setApplications(apps);
    } catch (err) {
      console.error("Network or parsing error:", err);
      setApplications([]);
    }
  };

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        const res = await fetch(`${backendUrl}auth/my`, {
          credentials: "include",
        });
        const userData = await res.json();
        setWorker(userData.data.Worker);
        setWorkInfo(userData.data);
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

    const fetchWorkerEarning = async () => {
      try {
        const res = await fetch(`${backendUrl}auth/workerReports`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          console.log("data", data);
          setTotalEarning(data?.data?.totalEarning || 0);
        } else {
          setTotalEarning(0);
        }
      } catch (err) {
        console.error("Error fetching earnings:", err);
        setTotalEarning(0);
      }
    };

    fetchWorkerProfile();
    fetchRecommendedWorks();
    fetchWorkerEarning();
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
     
      <aside className="bg-gradient-to-br from-blue-50 to-blue-100 md:w-72 w-full p-6 border-b md:border-b-0 md:border-r border-blue-200 flex flex-col space-y-6 overflow-auto">
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

        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100 overflow-auto">
          <div className="items-center mb-3 pb-2 border-b border-blue-400 inline-flex">
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
                    d="M8 7V3m8 4V3m-9 8h10m-12 5a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v7z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-blue-500 font-medium">Joined On</p>
                <p className="text-sm text-blue-800">
                  {workinfo?.JoinedOn || "Jan 1 2001"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-auto">
        {isAvailable ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-blue-900">Recommended Works</h1>
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
                    <h2 className="text-lg font-semibold text-blue-800">{work.title}</h2>
                    <p className="text-gray-600">{work.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-20">
            <p>You are currently unavailable. Turn on availability to see recommended works.</p>
          </div>
        )}
      </main>

    
      <aside className="bg-gradient-to-br from-blue-50 to-blue-100 md:w-64 w-full p-5 border-t md:border-t-0 md:border-l border-blue-200 flex flex-col space-y-5 overflow-auto shadow-sm">
        
        <div className="pb-2 border-b border-blue-400">
          <div className="inline-flex items-center gap-3">
            <FaBriefcase className="w-5 h-5 text-blue-600 animate-pulse" />
            <h2 className="text-md font-semibold text-blue-900">Work Statistics</h2>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-sm border border-green-200 flex items-center gap-3 hover:bg-blue-50 transition">
          <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg select-none">
            <FaRupeeSign />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Total Earnings</p>
            <p className="text-base font-bold text-blue-900">NPR. {totalEarning}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-200 flex items-center gap-3 hover:bg-blue-50 transition">
          <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg select-none">
            <FaCheck />
          </div>
          <div className="flex-1">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Completed</p>
            <div className="flex items-center gap-12">
              <p className="text-base font-bold text-blue-900">{workinfo?.jobDone || 0}</p>
              <button
                onClick={() => openApplications("completed")}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                View History
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl shadow-sm border border-purple-200 flex items-center gap-3 hover:bg-blue-50 transition">
          <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-lg select-none">
            <FaFileAlt />
          </div>
          <div className="flex-1">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Applied</p>
            <div className="flex items-center gap-6">
              <p className="text-base font-bold text-blue-900">{workinfo?.jobApplied ?? 0}</p>
              <button
                onClick={() => openApplications("applied")}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                View Applications
              </button>
            </div>
          </div>
        </div>
      </aside>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/10 flex justify-center items-center z-50 transition-opacity"
          style={{ backdropFilter: "blur(2px)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[420px] max-h-[80vh] overflow-hidden transform transition-all scale-95 hover:scale-100 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-center items-center relative">
              <h2 className="text-xl font-semibold text-blue-900 text-center">
                {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Applications
              </h2>
            </div>

            <div className="p-6 overflow-auto max-h-[60vh] space-y-3">
              {applications.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No applications found.</p>
              ) : (
                <ul className="space-y-3">
                  {applications.map((app) => (
                    <li
                      key={app._id}
                      className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-100"
                    >
                      <p className="font-semibold text-blue-800">{app.jobId?.title || "No Title"}</p>
                      <p className="text-gray-600 capitalize text-sm">Status: {app.status}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
