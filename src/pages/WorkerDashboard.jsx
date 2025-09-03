import React, { useEffect, useState } from "react";
import { FaBriefcase, FaChartLine, FaCheck, FaFileAlt, FaFolder, FaMapMarkedAlt, FaMoneyBillWave, FaRupeeSign,FaPhone, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LifeSidebar";

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
  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [viewAllRating, setViewAllRating] = useState("false");
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken")

  const ratingsToShow = (ratings || []).slice(0, viewAllRating ? ratings.length : 2);

  const openApplications = async (status) => {
  setSelectedStatus(status);
  setShowModal(true);

  if (
    (status === "applied" && (!workinfo?.JobsApplied || workinfo.JobsApplied === 0)) ||
    (status === "completed" && (!workinfo?.JobsDone || workinfo.JobsDone === 0))
  ) {
    setApplications([]);
    return;
  }

  try {
    let url = "";
    if (status === "completed") {
      url = `${backendUrl}auth/myCompleted`;

    } else if (status === "applied") {
      url = `${backendUrl}job/worker/get/application`;
    }

    console.log("Fetching applications for status:", status);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
      if (res.status === 404) {
        setApplications([]);
        return;
      }
      console.error("Error from backend:", errorData);
      setApplications([]);
      return;
    }

    const userData = await res.json();

    if (status === "completed") {
      setApplications(userData.data|| []);
    } else if (status === "applied") {
      let apps = userData.data?.myApplications || [];
      apps = apps.filter((a) => a.status !== "completed");
      setApplications(apps);
    }
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
        const res = await fetch(`${backendUrl}job/recomendJob`, {
          method: 'GET',
          credentials: "include",
          headers: {
            "Authorization" : `Bearer ${token}`,
            "Content-Type" : "application/json",
          }
        });
        if (res.ok) {
          const data = await res.json();
          setRecommendedWorks((data.data.forExperienced)? data.data.forExperienced: data.data.forBelowExperienced);
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
          method: "GET",
          credentials: "include",
          headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
          }
        });

        if (res.ok) {
          const data = await res.json();
          setTotalEarning(data?.data?.totalEarning || 0);
        } else {
          setTotalEarning(0);
        }
      } catch (err) {
        console.error("Error fetching earnings:", err);
        setTotalEarning(0);
      }
    };

    const fetchRecentRatings = async () => {
      try {
        const res = await fetch(`${backendUrl}rating/recent`, {
          method:"GET",
          credentials: "include",
          headers:{
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const data = await res.json();
          setRatings(data.data);
        } else {
          setRatings([]);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
        setRatings([]);
      } finally {
        setLoadingRatings(false);
      }
    };

    
    fetchWorkerProfile();
    fetchRecommendedWorks();
    fetchWorkerEarning();
    fetchRecentRatings();
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
        <LeftSidebar 
        worker={worker}
        workinfo={workinfo} 
        isWorker={true} 
        isAvailable={isAvailable} 
        toggleAvailability={toggleAvailability} 
        />
   
      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-auto">
        {isAvailable ? (
          <>
            <h1 className="text-2xl font-bold mb-2 text-blue-900">
              Recommended Works
            </h1>
            {loadingWorks ? (
              <p className="text-gray-500">Loading recommended works...</p>
            ) : recommendedWorks.length === 0 ? (
              <p className="text-gray-500">No recommended works available.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 p-4">
                {recommendedWorks.map((job) =>
                  job._id && job.title ? (
                    <div
                      key={job._id}
                      className="relative overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all flex flex-col hover:border-blue-300"
                    >
                      {/* Priority indicator ribbon */}
                      <div
                        className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold rounded-bl-lg ${
                          job.priority === "high"
                            ? "bg-red-500 text-white"
                            : job.priority === "medium"
                            ? "bg-yellow-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
                      >
                        {job.priority}
                      </div>

                      {/* Gradient top border */}
                      <div className="h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 w-full" />

                      <div className="flex-grow p-4 flex flex-col">
                        {/* Title row */}
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-xl font-bold text-gray-800 truncate">
                            {job.title}
                          </h2>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {job.description}
                        </p>

                        {/* Details section */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-start">
                            <FaFolder className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-medium text-gray-500">
                                Category
                              </span>
                              <p className="text-sm text-gray-700">
                                {job.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <FaMapMarkedAlt className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-medium text-gray-500">
                                Address
                              </span>
                              <p className="text-sm text-gray-700">
                                {job.address}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <FaRupeeSign className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-medium text-gray-500">
                                Price Range
                              </span>
                              <p className="text-sm text-gray-700">
                                NPR {job.priceRange?.initial} -{" "}
                                {job.priceRange?.end}
                              </p>
                            </div>
                          </div>

                          {/* User details moved to middle section */}
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  job.createdBy?.profilePicture ||
                                  "/default-avatar.png"
                                }
                                alt={job.createdBy?.fullName || "User"}
                                className="w-9 h-9 rounded-full object-cover border-2 border-blue-200"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/default-avatar.png";
                                }}
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {job.createdBy?.fullName || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <FaPhone className="text-gray-400 text-xs" />
                                  {job.createdBy?.phoneNo || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Job Posted date */}
                          <div className="text-center text-xs text-gray-500 mt-2">
                            Job Posted:{" "}
                            {new Date(job.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </div>

                        {/* Apply button at bottom */}
                        <div className="mt-auto pt-3">
                          <button
                            onClick={() =>
                              navigate(`/worker-dashboard/apply/${job._id}`)
                            }
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm cursor-pointer"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>

                      {/* Gradient bottom border */}
                      <div className="h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 w-full" />
                    </div>
                  ) : null
                )}
              </div>
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

      <aside className="bg-gradient-to-br from-blue-50 to-blue-100 md:w-72 w-full p-6 border-b md:border-b-0 md:border-l border-blue-200 flex flex-col space-y-6 overflow-hidden min-h-screen">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="items-center mb-3 pb-2 border-b border-blue-400 inline-flex gap-3">
            <FaBriefcase className="w-5 h-5 text-blue-600 animate-pulse" />
            <h2
              className="text-md font-semibold text-blue-900"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              Work Statistics
            </h2>
          </div>

          <div className="p-3 rounded-lg border border-green-200 flex items-center gap-3 mb-3 hover:bg-blue-50 transition cursor-default">
            <div className="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg select-none">
              <FaRupeeSign />
            </div>
            <div className="flex flex-col">
              <p className="text-xs text-blue-500 font-medium">
                Total Earnings
              </p>
              <p className="text-sm text-blue-800">NPR. {totalEarning}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-blue-200 flex items-center gap-3 mb-3 hover:bg-blue-50 transition cursor-default">
            <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg select-none">
              <FaCheck />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-xs text-blue-500 font-medium">Completed</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {workinfo?.JobsDone || 0}
                </p>
                <button
                  onClick={() => openApplications("completed")}
                  className="text-xs text-blue-800 hover:underline cursor-pointer whitespace-nowrap"
                >
                  View History
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-purple-200 flex items-center gap-3 hover:bg-blue-50 transition cursor-default">
            <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-lg select-none">
              <FaFileAlt />
            </div>
            <div className="flex flex-col flex-1">
              <p className="text-xs text-blue-500 font-medium">Applied</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  {workinfo?.JobsApplied ?? 0}
                </p>
                <button
                  onClick={() => openApplications("applied")}
                  className="text-xs text-blue-800 hover:underline cursor-pointer whitespace-nowrap"
                >
                  View Applications
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-2 bg-white rounded-xl shadow-sm border border-blue-100 flex flex-col">
          <div className="items-center mb-3 pb-2 border-b border-blue-400 inline-flex gap-3">
            <span className="text-sm inline-flex">💬</span>
            <h2
              className="text-md font-semibold text-blue-900"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              Feedback & Reviews
            </h2>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-yellow-50 mb-4 hover:bg-yellow-100 transition">
            <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center text-lg">
              <FaChartLine className="text-yellow-600 text-xl" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-blue-500 font-medium">
                Average Rating
              </p>
              {ratings.length > 0 ? (
                <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold">
                  <span>
                    {(
                      ratings.reduce((acc, r) => acc + r.point, 0) /
                      ratings.length
                    ).toFixed(1)}
                  </span>
                  <FaStar />
                </div>
              ) : (
                <p className="text-xs text-yellow-800 font-semibold">
                  No ratings yet
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-3 max-h-64 overflow-auto">
            {ratingsToShow.map((r) => (
              <div
                key={r._id}
                className="p-3 bg-blue-50 rounded-lg shadow-sm flex gap-3 items-start"
              >
                <img
                  src={r.raterUserId?.profilePicture || "/default-avatar.png"}
                  alt={r.raterUserId?.fullName || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-gray-300 flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-blue-900 truncate">
                      {r.raterUserId?.fullName || "User"}
                    </p>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className="text-base leading-none select-none"
                        >
                          {i < r.point ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  </div>

                  <textarea
                    readOnly
                    value={r.comment}
                    className="-ml-13 mt-8 w-[180px] resize-none rounded-md border border-gray-300 p-2 text-xs text-gray-700 min-h-[72px] max-h-36 overflow-y-auto"
                    aria-label="User comment"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setViewAllRating(!viewAllRating)}
            className="mt-4 p-2 text-xs text-blue-800 hover:underline text-center border-t border-gray-200"
          >
            {viewAllRating ? "Hide All Ratings" : "View All Ratings"}
          </button>
        </div>
      </aside>

      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-[420px] max-h-[80vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100 hover:scale-[1.01]">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white tracking-wide">
                {selectedStatus.charAt(0).toUpperCase() +
                  selectedStatus.slice(1)}{" "}
                {selectedStatus === "completed" ? "Jobs" : "Applications"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white text-xl font-bold hover:scale-110 transition-transform"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-auto flex-1 bg-gray-50 space-y-3">
              {applications.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">
                  No {selectedStatus === "completed" ? "jobs" : "applications"}{" "}
                  found.
                </p>
              ) : selectedStatus === "completed" ? (
                // Completed jobs rendering
                <ul className="space-y-3">
                  {applications.map((job, index) => (
                    <li
                      key={job._id}
                      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100"
                    >
                      <p className="font-semibold text-base">
                        <span className="text-gray-600">{index + 1}.</span>{" "}
                        <span className="text-blue-800">Title:</span>{" "}
                        <span className="text-gray-600">
                          {job.title || "No Title"}
                        </span>
                      </p>
                      <p className="font-semibold text-base mt-1">
                        <span className="text-blue-800 ml-3.5">Priority:</span>{" "}
                        <span className="text-gray-600">
                          {job.priority || "N/A"}
                        </span>
                      </p>
                      <p className="font-semibold text-base mt-1">
                        <span className="text-blue-800 ml-3.5">Address:</span>{" "}
                        <span className="text-gray-600">
                          {job.address || "N/A"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Posted on:{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                // Applied applications rendering (your existing code)
                <ul className="space-y-3">
                  {applications.map((app, index) => (
                    <li
                      key={app._id}
                      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-100"
                    >
                      <p className="font-semibold text-base">
                        <span className="text-gray-600">{index + 1}.</span>{" "}
                        <span className="text-blue-800">Title:</span>{" "}
                        <span className="text-gray-600">
                          {app.jobId?.title || "No Title"}
                        </span>
                      </p>

                      <p className="font-semibold text-base mt-1">
                        <span className="text-blue-800 ml-3.5">Category:</span>{" "}
                        <span className="text-gray-600">
                          {app.jobId?.category || "N/A"}
                        </span>
                      </p>

                      <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                        <p>
                          ⏳ Applied on:{" "}
                          {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            app.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : app.status === "pending"
                              ? "bg-blue-100 text-blue-500"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {app.status || "Unknown"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-5 py-3 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition"
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
