import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LifeSidebar";

const backendUrl = import.meta.env.VITE_BASE_URL;

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showJobs, setShowJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

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
    const fetchUserProfile = async () => {
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
    fetchUserProfile();
  }, [navigate]);

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
      const res = await fetch(`${backendUrl}job/user/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobForm),
      });
      if (res.ok) {
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

        // ✅ Show success message
        setSuccessMessage("Your job has been posted successfully");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      console.error("Error creating job:", err);
    }
  };

  // View applications
  const viewApplications = async (jobId) => {
    try {
      const res = await fetch(`${backendUrl}job/user/apply/view/${jobId}`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setApplications((prev) => ({ ...prev, [jobId]: data.data || [] }));
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  // Handle deadline change
  const handleDeadlineChange = (e) => {
    const selectedDate = e.target.value;
    setJobForm({ ...jobForm, deadline: selectedDate });
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
      setShowUrgentAlert(true);
      setTimeout(() => setShowUrgentAlert(false), 5000);
    }
  };

  // Handle price change
  const handlePriceChange = (e, field) => {
    const value = Math.max(0, e.target.value); // Ensure price is not negative
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
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition duration-300 ease-in-out bg-white shadow-md`}
    >
      {/* Existing Sidebar */}
      <LeftSidebar worker={user} workinfo={user} isWorker={false} />

      {/* My Jobs Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setShowJobs(!showJobs)}
          className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md"
        >
          <span>📋 My Jobs</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              showJobs ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showJobs && (
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-3">
                No jobs created yet.
              </p>
            ) : (
              jobs.map((job) => (
  <div
    key={job._id}
    className="bg-white hover:shadow-lg transition rounded-xl p-3 border border-gray-200"
  >
    <h3 className="font-semibold text-sm text-blue-700 truncate">{job.title}</h3>
    <p className="text-xs text-gray-500 font-medium">
      💰 रु{job.priceRange.initial} - रु{job.priceRange.end}
    </p>

    <div className="mt-2 flex space-x-2">
      <button
        className="flex-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md shadow-sm cursor-pointer"
        onClick={() => viewApplications(job._id)}
      >
        View Applications
      </button>
      <button
        className="flex-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white py-1 rounded-md shadow-sm cursor-pointer"
        onClick={() => setSelectedJob(job)}
      >
        More
      </button>
    </div>

    {applications[job._id] && (
      <div className="mt-2 bg-gray-50 border rounded-md p-2 shadow-inner">
        <h4 className="text-xs font-semibold mb-1 text-gray-700">
          Applications ({applications[job._id].length})
        </h4>
        {applications[job._id].length === 0 ? (
          <p className="text-xs text-gray-500">No applications yet.</p>
        ) : (
          applications[job._id].map((app) => (
            <p
              key={app._id}
              className="text-xs text-gray-700 truncate flex items-center"
            >
              👷 <span className="ml-1">{app.worker.fullName}</span>
            </p>
          ))
        )}
      </div>
    )}
  </div>
))
            )}
          </div>
        )}
      </div>
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Welcome, {user?.fullName || "User"}!</h1>
              <p className="text-gray-600 text-sm md:text-base">Manage your jobs and find the right workers</p>
            </div>
          </div>


          {/* ✅ Job Creation Form */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-md mr-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Create New Job</h2>
            </div>
            
            <form onSubmit={handleCreateJob} className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., Electrician Repair, Plumbing Repair"
                      value={jobForm.title}
                      onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                      className="pl-10 border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., Plumber, Electrician, Cleaner"
                      value={jobForm.category}
                      onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                      className="pl-10 border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <textarea
                      placeholder="Describe the job in detail..."
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      className="pl-10 border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (रु)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">रु</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={jobForm.priceRange.initial}
                      onChange={(e) => handlePriceChange(e, 'initial')}
                      className="pl-8 border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  {errors.initialPrice && <p className="text-red-500 text-xs mt-1">{errors.initialPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (रु)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">रु</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="1000"
                      value={jobForm.priceRange.end}
                      onChange={(e) => handlePriceChange(e, 'end')}
                      className="pl-8 border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  {errors.endPrice && <p className="text-red-500 text-xs mt-1">{errors.endPrice}</p>}
                  {errors.priceRange && <p className="text-red-500 text-xs mt-1">{errors.priceRange}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <select
                      value={jobForm.priority}
                      onChange={(e) => setJobForm({ ...jobForm, priority: e.target.value })}
                      className="pl-10 border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                      required
                    >
                      <option value="">Select Priority</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={jobForm.deadline}
                      onChange={handleDeadlineChange}
                      className="pl-10 border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter complete address"
                      value={jobForm.address}
                      onChange={(e) => setJobForm({ ...jobForm, address: e.target.value })}
                      className="pl-10 border border-gray-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-md transition duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Post Job
              </button>
            </form>
          </div>
        </div>
      </main>
    {selectedJob && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={() => setSelectedJob(null)}
  >
    <div
      className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-blue-100 hover:text-blue-500 text-2xl font-bold cursor-pointer"
        onClick={() => setSelectedJob(null)}
      >
        ✖
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-blue-600 border-2 pb-2 mb-4 inline-block">
        <span className="text-blue-600 ml-1">Title:</span> <span className="text-gray-600 gap-1.5 mr-1 ">{selectedJob.title}</span>
      </h2>


      {/* Price */}
      <p className="text-sm text-blue-600 font-medium">
        💵 Price: <span className="text-gray-600 font-semibold">रु {selectedJob.priceRange.initial} - रु {selectedJob.priceRange.end}</span>
      </p>

      {/* Category */}
      <p className="text-sm text-gray-600">
        🏷️ <span className="font-medium text-blue-600">Category:</span> {selectedJob.category}
      </p>

      {/* Description */}
      <p className="text-sm text-gray-600">
        📄 <span className="font-medium text-blue-600">Description:</span> {selectedJob.description}
      </p>

      {/* Address */}
      <p className="text-sm text-gray-600">
        📍 <span className="font-medium text-blue-600">Address:</span> {selectedJob.address}
      </p>

      {/* Deadline */}
      <p className="text-sm text-gray-600">
        ⏰ <span className="font-medium text-blue-600">Deadline:</span> {new Date(selectedJob.deadline).toLocaleDateString()}
      </p>

      {/* Priority */}
      <p className="text-sm text-gray-600">
        ⚡ <span className="font-medium text-blue-600">Priority:</span> {selectedJob.priority.charAt(0).toUpperCase() + selectedJob.priority.slice(1)}
      </p>
    </div>
  </div>
)}

    </div>
  );
};

export default UserDashboard;