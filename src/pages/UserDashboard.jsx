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
        headers: { "Content-Type": "application/json" },
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <div className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-300 ease-in-out`}>
        <LeftSidebar worker={user} workinfo={user} isWorker={false} />
        
      </div>

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

          {/* ✅ My Jobs */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-md mr-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">My Jobs</h2>
            </div>
            
            {jobs.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center">
                <svg className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p className="mt-3 md:mt-4 text-gray-600 text-sm md:text-base">No jobs created yet.</p>
                <p className="text-xs md:text-sm text-gray-500">Post your first job to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                {jobs.map((job) => (
                  <div key={job._id} className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                      <h3 className="font-semibold text-base md:text-lg text-blue-800 mb-2 md:mb-0">{job.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${
                        job.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        job.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {job.priority} Priority
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">{job.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-3">
                      <div className="flex items-center text-xs md:text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>रु{job.priceRange.initial} - रु{job.priceRange.end}</span>
                      </div>
                      <div className="flex items-center text-xs md:text-sm text-gray-700">
                        <svg className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>{new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-xs md:text-sm text-gray-700 col-span-1 sm:col-span-2">
                        <svg className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span className="truncate">{job.category}</span>
                      </div>
                    </div>
                    
                    <button
                      className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md text-xs md:text-sm transition duration-300"
                      onClick={() => viewApplications(job._id)}
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      View Applications
                    </button>

                    {/* Applications */}
                    {applications[job._id] && (
                      <div className="mt-4 bg-gray-50 border rounded-md p-3">
                        <h4 className="font-medium text-xs md:text-sm text-gray-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                          Applications ({applications[job._id].length})
                        </h4>
                        {applications[job._id].length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-2">No applications yet.</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {applications[job._id].map((app) => (
                              <div key={app._id} className="p-2 border border-gray-200 rounded-md bg-white">
                                <div className="flex items-center">
                                  <div className="bg-blue-100 p-1 rounded-full mr-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                  </div>
                                  <p className="text-xs md:text-sm font-medium truncate">👷 {app.worker.fullName}</p>
                                </div>
                                {app.message && (
                                  <p className="text-xs text-gray-600 mt-1 pl-6 line-clamp-2">{app.message}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
                   </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;