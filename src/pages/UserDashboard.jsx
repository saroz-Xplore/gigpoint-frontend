import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LifeSidebar";
import { FaUser, FaPhone, FaHome } from "react-icons/fa";
import { FaMoneyBillWave, FaTag, FaRegFileAlt, FaMapMarkerAlt, FaClock, FaBolt } from "react-icons/fa";
import { FaCheck, FaTimes } from "react-icons/fa";

const backendUrl = import.meta.env.VITE_BASE_URL;

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showJobs, setShowJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [approvedApps, setApprovedApps] = useState([]);
  const [showApprovedJobs, setShowApprovedJobs] = useState(false);
  const [confirmJobId, setConfirmJobId] = useState(null);
  
  const [openJobId, setOpenJobId] = useState(null);

  const token = localStorage.getItem("accessToken");

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    priceRange: { initial: "", end: "" },
    priority: "",
    category: "",
    address: "",
    deadline: "",
  });
  const [errors, setErrors] = useState({});
  const [showUrgentAlert, setShowUrgentAlert] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${backendUrl}auth/my`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
    fetchUser();
  }, [navigate, token]);

  // Fetch jobs
  const fetchMyJobs = async () => {
    try {
      const res = await fetch(`${backendUrl}job/user/get/jobs`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setJobs(Array.isArray(data.data.myJobsPost) ? data.data.myJobsPost : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    setDeletingJobId(jobId);
    try {
      const res = await fetch(`${backendUrl}job/user/delete/${jobId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
        setSuccessMessage("Job deleted successfully");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        console.error("Delete failed:", data);
      }
    } catch (err) {
      console.error("Error deleting job:", err);
    } finally {
      setDeletingJobId(null);
      setConfirmJobId(null);
    }
  };

  // Approve application (calls backend)
  const approveApplication = async (jobId, applicationId) => {
    try {
      const res = await fetch(`${backendUrl}job/user/approve/${jobId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      });

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Approval failed:", err);
      return null;
    }
  };

  // Updated handleApprove function
  const handleApprove = async (jobId, appId) => {
  try {
    const res = await approveApplication(jobId, appId);
    
    if (res?.success) {
      const approvedJob = res.data.job;
      const approvedApp = res.data.application;

      // 1️⃣ Remove approved application from applications list
      setApplications(prev => ({
        ...prev,
        [jobId]: prev[jobId]?.filter(app => app._id !== appId) || []
      }));

      // 2️⃣ Remove job completely from My Jobs section
      setJobs(prevJobs => prevJobs.filter(j => j._id !== jobId));

      // 3️⃣ Add to Approved Jobs section
      const newApproved = {
  jobId: approvedJob._id,
  applicationId: appId,
  title: approvedJob.title,
  description: approvedJob.description,
  appliedBy: approvedApp.appliedBy,   // <-- THIS IS CORRECT
  estimatedPrice: approvedApp.estimatedPrice,
  message: approvedApp.message,
  approvedAt: new Date().toISOString()
};


      setApprovedApps(prev => [...prev, newApproved]);


      // 4️⃣ Success message
      setSuccessMessage("Application Approved Successfully");
      setTimeout(() => setSuccessMessage(""), 4000);
    }

  } catch (err) {
    console.error("Approval failed:", err);
  }
};


  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (jobForm.priceRange.initial < 0) newErrors.initialPrice = "Price cannot be negative";
    if (jobForm.priceRange.end < 0) newErrors.endPrice = "Price cannot be negative";
    if (parseFloat(jobForm.priceRange.end) < parseFloat(jobForm.priceRange.initial)) newErrors.priceRange = "Maximum price should be greater than minimum price";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(jobForm.deadline);
    if (jobForm.deadline && selectedDate < today) newErrors.deadline = "Cannot select a past date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create job
  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        ...jobForm,
        priceRange: {
          initial: parseFloat(jobForm.priceRange.initial),
          end: parseFloat(jobForm.priceRange.end),
        },
        deadline: jobForm.deadline,
      };

      const res = await fetch(`${backendUrl}job/user/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("Job creation response:", data);

      if (res.ok && data.success) {
        setJobForm({
          title: "",
          description: "",
          priceRange: { initial: "", end: "" },
          priority: "",
          category: "",
          address: "",
          deadline: "",
        });
        setErrors({});

        fetchMyJobs();

        setSuccessMessage("Your job has been posted successfully");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        console.error("Create job failed:", data.message || data);
        alert(data.message || "Job creation failed. Check console for details.");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      alert("An unexpected error occurred. Check console for details.");
    }
  };

  // View applications (TOGGLE) — fetch only when opening
 const viewApplications = async (jobId) => {
  if (openJobId === jobId) {
    // Hide immediately
    setOpenJobId(null);
    return;
  }

  // If already fetched, just show immediately
  if (applications[jobId]) {
    setOpenJobId(jobId);
    return;
  }

  try {
    const res = await fetch(`${backendUrl}job/user/apply/view/${jobId}`, {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    let apps = [];
    if (Array.isArray(data.data.allApplications)) {
      apps = data.data.allApplications;
    } else if (data.data.allApplications) {
      apps = [data.data.allApplications];
    }

    const filteredApps = apps.filter(app => 
      !approvedApps.some(approved => approved.jobId === jobId && approved.applicationId === app._id)
    );

    setApplications((prev) => ({ ...prev, [jobId]: filteredApps }));
    setOpenJobId(jobId); // show immediately after fetch
  } catch (err) {
    console.error("Error fetching applications:", err);
  }
};

  // Handle deadline change
  const handleDeadlineChange = (e) => {
    const selectedDate = e.target.value;
    setJobForm({ ...jobForm, deadline: selectedDate });
    const today = new Date().toISOString().split("T")[0];
    if (selectedDate === today) {
      setShowUrgentAlert(true);
      setTimeout(() => setShowUrgentAlert(false), 5000);
    }
  };

  // Handle price change
  const handlePriceChange = (e, field) => {
    const value = Math.max(0, e.target.value);
    setJobForm({
      ...jobForm,
      priceRange: { ...jobForm.priceRange, [field]: value }
    });
  };

  useEffect(() => {
    if (user) fetchMyJobs();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-blue-600 text-base font-medium animate-pulse">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar + My Jobs */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition duration-300 ease-in-out bg-white shadow-md`}
      >
        <LeftSidebar worker={user} workinfo={user} isWorker={false} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {/* Urgent Worker Alert */}
        {showUrgentAlert && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <p className="font-medium">Need urgent worker immediately!</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-5 right-5 bg-green-100 border-l-4 border-green-500 text-green-700 px-5 py-3 rounded-md shadow-lg animate-slide-in z-50">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full mr-0 md:mr-4 mb-3 md:mb-0 self-start">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-blue-900">Welcome, {user?.fullName || "User"}!</h1>
              <p className="text-blue-600 text-sm md:text-base">Manage your jobs and find the right workers</p>
            </div>
          </div>

          {/* ✅ Job Creation Form */}
          <div className="max-w-5xl mx-auto mt-8 bg-gray-50 p-6 rounded-2xl shadow-xl">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-300 mb-4">
              <button
                onClick={() => { setShowCreateJob(true); setShowJobs(false); setShowApprovedJobs(false); }}
                className={`px-6 py-3 rounded-t-xl font-semibold text-sm transition-all ${showCreateJob ? "bg-white shadow-md border-t border-l border-r border-gray-300" : "text-gray-500 hover:text-gray-700"}`}
              >
                ➕ Hire Worker
              </button>
              <button
                onClick={() => { setShowJobs(true); setShowCreateJob(false); setShowApprovedJobs(false); }}
                className={`px-6 py-3 rounded-t-xl font-semibold text-sm transition-all ${showJobs ? "bg-white shadow-md border-t border-l border-r border-gray-300" : "text-gray-500 hover:text-gray-700"}`}
              >
                📋 My Jobs
              </button>
            </div>

            {/* Tabs Content */}
            <div className="bg-white p-6 rounded-b-2xl shadow-inner transition-all">
              {/* Hire Worker Form */}
              {showCreateJob && (
                <div className="transition-opacity duration-300">
                  {/* Job Form */}
                  <form
                    onSubmit={handleCreateJob}
                    className="mt-4 bg-white p-5 rounded-xl border border-gray-200 shadow-lg space-y-4 transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-blue-700 border-b pb-2">📝 Job Details</h2>
                        <div>
                          <label className="block text-sm font-medium text-blue-600 mb-1">Job Title</label>
                          <input
                            type="text"
                            placeholder="e.g., Electrician Repair"
                            value={jobForm.title}
                            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                            className="border border-gray-300 px-3 py-2 text-sm rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-600 mb-1">Category</label>
                          <input
                            type="text"
                            placeholder="e.g., Plumber, Cleaner"
                            value={jobForm.category}
                            onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                            className="border border-gray-300 px-3 py-2 text-sm rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-600 mb-1">Description</label>
                          <textarea
                            placeholder="Describe the job..."
                            value={jobForm.description}
                            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                            className="border border-gray-300 px-3 py-2 text-sm rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="4"
                            required
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-blue-700 border-b pb-2">💰 Pricing & Deadline</h2>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-blue-600 mb-1">Min Price (रु)</label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="0"
                              value={jobForm.priceRange.initial}
                              onChange={(e) => handlePriceChange(e, "initial")}
                              className="border border-gray-300 px-3 py-2 text-sm rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-600 mb-1">Max Price (रु)</label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="1000"
                              value={jobForm.priceRange.end}
                              onChange={(e) => handlePriceChange(e, "end")}
                              className="border border-gray-300 px-3 py-2 text-sm rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-blue-600 mb-1">Priority</label>
                            <select
                              value={jobForm.priority}
                              onChange={(e) => setJobForm({ ...jobForm, priority: e.target.value })}
                              className="border border-gray-300 px-3 py-2 text-sm rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            >
                              <option value="">Select</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-blue-600 mb-1">Deadline</label>
                            <input
                              type="date"
                              min={new Date().toISOString().split("T")[0]}
                              value={jobForm.deadline}
                              onChange={handleDeadlineChange}
                              className="border border-gray-300 text-sm rounded-md w-full h-10 px-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-600 mb-1">Address</label>
                          <textarea
                            placeholder="Enter complete address"
                            value={jobForm.address}
                            onChange={(e) => setJobForm({ ...jobForm, address: e.target.value })}
                            className="border border-gray-300 px-3 py-2 text-sm rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="4"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-medium shadow-md transition cursor-pointer"
                    >
                      🚀 Post Job
                    </button>
                  </form>
                </div>
              )}

              {/* My Jobs */}
              {showJobs && (
                <div className="transition-opacity duration-300 space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-gray-100">
                  {jobs.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-3">No jobs created yet.</p>
                  ) : (
                    jobs.map((job) => (
                      <div key={job._id} className="bg-white hover:shadow-lg transition rounded-xl p-3 border border-gray-200">
                        <h3 className="font-semibold text-sm text-blue-700 truncate">{job.title}</h3>
                        <p className="text-xs text-gray-500 font-medium">
                          💰 रु{job.priceRange.initial} - रु{job.priceRange.end}
                        </p>

                        <div className="mt-2 flex space-x-2">
                          <button
                            className="flex-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md shadow-sm cursor-pointer"
                            onClick={() => viewApplications(job._id)}
                          >
                            {openJobId === job._id ? "Hide Applications" : "View Applications"}
                          </button>
                          <button
                            className="flex-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md shadow-sm cursor-pointer"
                            onClick={() => setSelectedJob(job)}
                          >
                            More
                          </button>
                          <button
                            className={`flex-1 text-[11px] ${
                              deletingJobId === job._id
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700"
                            } text-white py-1 rounded-md shadow-sm cursor-pointer`}
                            onClick={() => setConfirmJobId(job._id)}
                            disabled={deletingJobId === job._id}
                          >
                            {deletingJobId === job._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>

                        {/* Applications: ONLY render when this job is opened */}
                        {openJobId === job._id && (
                          <div className="mt-2 bg-gray-50 border border-blue-800 rounded-md p-2 shadow-inner">
                            <h4 className="text-xs font-semibold mb-2 text-gray-700">
                              Applications ({applications[job._id]?.length ?? 0})
                            </h4>

                            {(!applications[job._id] || applications[job._id].length === 0) ? (
                              <div className="mt-2 p-2 text-center text-blue-700 bg-blue-50 border border-blue-300 rounded shadow-sm">
                                <p>No applications received yet.</p>
                              </div>
                            ) : (
                              applications[job._id].map((app) => (
                                <div
                                  key={app._id}
                                  className="border border-blue-400 rounded-xl p-4 mb-3 shadow-sm bg-white hover:shadow-md transition"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="text-sm font-semibold text-blue-700 flex items-center gap-1">
                                        <FaUser className="text-gray-600" /> {app.appliedBy?.fullName || "N/A"}
                                      </h4>
                                      <p className="text-xs text-gray-600 flex items-center gap-1">
                                        <FaPhone className="text-gray-600" /> {app.appliedBy?.phoneNo || "N/A"}
                                      </p>
                                      <p className="text-xs text-gray-600 flex items-center gap-1">
                                        <FaHome className="text-gray-600" /> {app.appliedBy?.address || "N/A"}
                                      </p>    
                                    </div>
                                    {app.estimatedPrice && (
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-blue-600">रु {app.estimatedPrice} /-</p>
                                      </div>
                                    )}
                                  </div>
                                  {app.message && (
                                    <div className="mt-3 text-xs text-gray-700 italic border-l-4 border-blue-300 pl-3 bg-blue-50 rounded">
                                      "{app.message}"
                                    </div>
                                  )}
                                  <div className="mt-3 flex justify-end">
                                    {app.isAccepted ? (
                                      <span className="text-green-600 text-xs font-semibold">Approved ✅</span>
                                    ) : (
                                      <button
                                        onClick={() => handleApprove(job._id, app._id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md shadow-sm cursor-pointer"
                                      >
                                        Approve
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Approved Jobs */}
              {showApprovedJobs && (
                <div className="transition-opacity duration-300 space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-300">
                  {approvedApps.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-3">No approved applications yet.</p>
                  ) : (
                    approvedApps.map((app, index) => (
                      <div key={app._id} className="bg-white rounded-xl p-4 border hover:shadow-lg transition">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-1">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-green-700">{app.title}</h3>
                              <p className="text-sm text-gray-500 mb-2">💰 रु {app.estimatedPrice}</p>
                              <div className="space-y-1">
                                <p className="flex items-center gap-1 text-sm">
                                  <FaUser className="text-gray-600" /> {app.appliedBy?.fullName || "N/A"}
                                </p>
                                <p className="flex items-center gap-1 text-sm">
                                  <FaPhone className="text-gray-600" /> {app.appliedBy?.phoneNo || "N/A"}
                                </p>
                                <p className="flex items-center gap-1 text-sm">
                                  <FaHome className="text-gray-600" /> {app.appliedBy?.address || "N/A"}
                                </p>
                                {app.message && (
                                  <p className="italic text-xs mt-1 text-gray-600">"{app.message}"</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-green-600 text-xs font-semibold bg-green-100 px-2 py-1 rounded">
                            Approved
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Job Details Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-blue-100 hover:text-blue-500 text-2xl font-bold cursor-pointer"
              onClick={() => setSelectedJob(null)}
            >
              ✖
            </button>

            <h2 className="text-2xl font-bold text-blue-600 border-2 pb-2 mb-4 inline-block">
              <span className="text-blue-600 ml-1">Title:</span> <span className="text-gray-600 gap-1.5 mr-1 ">{selectedJob.title}</span>
            </h2>

            <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
              <FaMoneyBillWave className="text-green-600" /> Price: <span className="text-gray-600 font-semibold">रु {selectedJob.priceRange.initial} - रु {selectedJob.priceRange.end}</span>
            </p>

            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaTag className="text-orange-600" /> <span className="font-medium text-blue-600">Category:</span> {selectedJob.category}
            </p>

            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaRegFileAlt className="text-gray-600" /> <span className="font-medium text-blue-600">Description:</span> {selectedJob.description}
            </p>

            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaMapMarkerAlt className="text-yellow-600" /> <span className="font-medium text-blue-600">Address:</span> {selectedJob.address}
            </p>

            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaClock className="text-black-600" /> <span className="font-medium text-blue-600">Deadline:</span> {new Date(selectedJob.deadline).toLocaleDateString()}
            </p>

            <p className="text-sm text-gray-600 flex items-center gap-1">
              <FaBolt className="text-red-600" /> <span className="font-medium text-blue-600">Priority:</span> {selectedJob.priority.charAt(0).toUpperCase() + selectedJob.priority.slice(1)}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmJobId && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs w-full">
            <p className="mb-6 text-gray-800">
              Are you sure you want to delete this job?
            </p>
            
            <div className="flex justify-center gap-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2 justify-center"
                onClick={() => handleDeleteJob(confirmJobId)}
                disabled={deletingJobId === confirmJobId}
              >
                {deletingJobId === confirmJobId ? "Deleting..." : <><FaCheck /> Yes</>}
              </button>
              
              <button
                className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2 justify-center"
                onClick={() => setConfirmJobId(null)}
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;