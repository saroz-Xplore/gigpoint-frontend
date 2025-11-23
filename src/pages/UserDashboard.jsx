import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LeftSidebar from "../components/LifeSidebar";
import {
  FaUser,
  FaPhone,
  FaHome,
  FaMoneyBillWave,
  FaTag,
  FaRegFileAlt,
  FaMapMarkerAlt,
  FaClock,
  FaBolt,
  FaCheck,
  FaTimes,
  FaPlus,
  FaList,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { useUser } from "../context/UserContextProvider.jsx";

const backendUrl = import.meta.env.VITE_BASE_URL;

const CATEGORIES = [
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "cleaner", label: "Cleaner" },
  { value: "saloon", label: "Saloon" },
  { value: "carpentry", label: "Carpentry" },
  { value: "driver", label: "Driver" },
  { value: "homeRenovation", label: "Home Renovation" },
];

const JOB_TITLE_SUGGESTIONS = {
  plumber: [
    "Fix leaking bathroom faucet",
    "Install new kitchen sink",
    "Repair toilet flush system",
    "Unclog kitchen drain pipe",
    "Install water heater",
    "Fix shower head leakage",
    "Repair bathroom pipeline",
  ],
  electrician: [
    "Install ceiling fan",
    "Repair electrical switches",
    "Wiring for new room",
    "Fix power outage issue",
    "Install LED lights",
    "Socket and switchboard repair",
    "Electrical safety check",
  ],
  cleaner: [
    "Full house deep cleaning",
    "Office space cleaning",
    "Post-renovation cleaning",
    "Carpet and sofa cleaning",
    "Kitchen and bathroom cleaning",
    "Window and glass cleaning",
    "Monthly maintenance cleaning",
  ],
  saloon: [
    "Haircut and styling service",
    "Beard trim and grooming",
    "Hair coloring service",
    "Facial and skin care",
    "Hair spa treatment",
    "Makeup service for events",
    "Hair treatment for damage",
  ],
  carpentry: [
    "Build wooden cupboard",
    "Repair broken furniture",
    "Install wooden shelves",
    "Custom furniture making",
    "Door and window repair",
    "Wooden flooring installation",
    "Kitchen cabinet repair",
  ],
  driver: [
    "Daily office commute",
    "Airport pickup service",
    "Outstation trip driving",
    "School pickup service",
    "Wedding event driving",
    "Commercial vehicle driving",
    "Regular family driver",
  ],
  homeRenovation: [
    "Complete home renovation",
    "Kitchen remodeling service",
    "Bathroom renovation work",
    "Living room makeover",
    "Flooring replacement",
    "Wall painting and texture",
    "Space optimization work",
  ],
};

const UserDashboard = () => {
  const { user, loading } = useUser();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [selectedJob, setSelectedJob] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [approvedApps, setApprovedApps] = useState([]);
  const [openJobId, setOpenJobId] = useState(null);
  const [confirmJobId, setConfirmJobId] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState("error");
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState({});

  const token = localStorage.getItem("accessToken");

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    priceRange: { min: "", max: "" },
    priority: "medium",
    category: "",
    address: "",
    deadline: "",
  });

  const [errors, setErrors] = useState({});
  const [showUrgentAlert, setShowUrgentAlert] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const showError = (message, type = "error") => {
    setError(message);
    setErrorType(type);
    const timeout = type === "error" ? 5000 : 7000;
    setTimeout(() => {
      setError(null);
    }, timeout);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const fetchMyJobs = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}job/user/get/jobs`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to fetch jobs: ${res.status}`
        );
      }

      const data = await res.json();
      setJobs(Array.isArray(data.data.myJobsPost) ? data.data.myJobsPost : []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      showError(
        err.message || "Failed to load your jobs. Please try again.",
        "error"
      );
    }
  }, [token]);

  const handleDeleteJob = async (jobId) => {
    setDeletingJobId(jobId);
    try {
      const res = await fetch(`${backendUrl}job/user/delete/${jobId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || `Failed to delete job: ${res.status}`);
      }

      if (data.success) {
        setJobs((prev) => prev.filter((job) => job._id !== jobId));
        setApplications((prev) => {
          const newApps = { ...prev };
          delete newApps[jobId];
          return newApps;
        });
        showSuccess(data.message || "Job deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      if (
        err.message.includes("Please Login") ||
        err.message.includes("Invalid token") ||
        err.message.includes("token")
      ) {
        showError("Your session has expired. Please login again.", "error");
        setTimeout(() => navigate("/login"), 2000);
      } else if (
        err.message.includes("You Cannot Delete") ||
        err.message.includes("permission")
      ) {
        showError("You don't have permission to delete this job.", "error");
      } else if (err.message.includes("Not Found")) {
        showError("Job not found or already deleted.", "error");
        fetchMyJobs();
      } else {
        showError(
          err.message || "Failed to delete job. Please try again.",
          "error"
        );
      }
    } finally {
      setDeletingJobId(null);
      setConfirmJobId(null);
    }
  };

  const handleApprove = async (jobId, appId) => {
    try {
      const res = await fetch(`${backendUrl}job/user/approve/${jobId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId: appId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Approval failed");
      }

      if (data?.success) {
        const approvedJob = data.data.job;
        const approvedApp = data.data.application;

        setApplications((prev) => ({
          ...prev,
          [jobId]: prev[jobId]?.filter((app) => app._id !== appId) || [],
        }));

        setJobs((prev) => prev.filter((job) => job._id !== jobId));

        setApprovedApps((prev) => [
          ...prev,
          {
            jobId: approvedJob._id,
            applicationId: appId,
            title: approvedJob.title,
            description: approvedJob.description,
            appliedBy: approvedApp.appliedBy,
            estimatedPrice: approvedApp.estimatedPrice,
            message: approvedApp.message,
            approvedAt: new Date().toISOString(),
          },
        ]);

        showSuccess("Application Approved Successfully");
      }
    } catch (err) {
      console.error("Approval failed:", err);
      showError(
        err.message || "Failed to approve application. Please try again.",
        "error"
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!jobForm.title.trim()) newErrors.title = "Title is required";
    if (!jobForm.category) newErrors.category = "Category is required";
    if (!jobForm.description.trim())
      newErrors.description = "Description is required";
    if (!jobForm.address.trim()) newErrors.address = "Address is required";
    if (!jobForm.deadline) newErrors.deadline = "Deadline is required";

    const minPrice = parseFloat(jobForm.priceRange.min);
    const maxPrice = parseFloat(jobForm.priceRange.max);

    if (isNaN(minPrice) || minPrice < 0)
      newErrors.minPrice = "Valid price is required";
    if (isNaN(maxPrice) || maxPrice < 0)
      newErrors.maxPrice = "Valid price is required";
    if (maxPrice < minPrice)
      newErrors.priceRange = "Maximum price must be greater than minimum price";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(jobForm.deadline);
    if (selectedDate < today) newErrors.deadline = "Cannot select a past date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the form errors before submitting.", "warning");
      return;
    }

    try {
      const payload = {
        ...jobForm,
        priceRange: {
          initial: parseFloat(jobForm.priceRange.min),
          end: parseFloat(jobForm.priceRange.max),
        },
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

      if (!res.ok) {
        throw new Error(data.message || "Job creation failed");
      }

      if (res.ok && data.success) {
        setJobForm({
          title: "",
          description: "",
          priceRange: { min: "", max: "" },
          priority: "medium",
          category: "",
          address: "",
          deadline: "",
        });
        setErrors({});
        fetchMyJobs();
        setActiveTab("jobs");
        showSuccess("Your job has been posted successfully");
      }
    } catch (err) {
      console.error("Error creating job:", err);
      showError(
        err.message || "Failed to create job. Please try again.",
        "error"
      );
    }
  };

  const viewApplications = async (jobId) => {
    if (openJobId === jobId) {
      setOpenJobId(null);
      return;
    }

    if (applications[jobId]) {
      setOpenJobId(jobId);
      return;
    }

    setLoadingApplications((prev) => ({ ...prev, [jobId]: true }));

    try {
      const res = await fetch(`${backendUrl}job/user/apply/view/${jobId}`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load applications");
      }

      const data = await res.json();
      let apps = [];

      if (Array.isArray(data.data?.allApplications)) {
        apps = data.data.allApplications;
      } else if (data.data?.allApplications) {
        apps = [data.data.allApplications];
      } else {
        apps = [];
      }

      const filteredApps = apps.filter(
        (app) =>
          !approvedApps.some(
            (approved) =>
              approved.jobId === jobId && approved.applicationId === app._id
          )
      );

      setApplications((prev) => ({ ...prev, [jobId]: filteredApps }));
      setOpenJobId(jobId);
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (
        err.message.includes("No applications") ||
        err.message.includes("not found")
      ) {
        setApplications((prev) => ({ ...prev, [jobId]: [] }));
        setOpenJobId(jobId);
      } else {
        showError(
          err.message || "Failed to load applications. Please try again.",
          "error"
        );
      }
    } finally {
      setLoadingApplications((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setJobForm({ ...jobForm, category, title: "" });

    if (category && JOB_TITLE_SUGGESTIONS[category]) {
      setTitleSuggestions(JOB_TITLE_SUGGESTIONS[category]);
    } else {
      setTitleSuggestions([]);
    }
  };

  const handleTitleFocus = () => {
    if (jobForm.category && JOB_TITLE_SUGGESTIONS[jobForm.category]) {
      setShowSuggestions(true);
    }
  };

  const handleTitleChange = (e) => {
    setJobForm({ ...jobForm, title: e.target.value });
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion) => {
    setJobForm({ ...jobForm, title: suggestion });
    setShowSuggestions(false);
  };

  const handlePriceChange = (e, field) => {
    const value = Math.max(0, e.target.value);
    setJobForm({
      ...jobForm,
      priceRange: { ...jobForm.priceRange, [field]: value },
    });
  };

  const handleDeadlineChange = (e) => {
    const selectedDate = e.target.value;
    setJobForm({ ...jobForm, deadline: selectedDate });

    const today = new Date().toISOString().split("T")[0];
    if (selectedDate === today) {
      setShowUrgentAlert(true);
      setTimeout(() => setShowUrgentAlert(false), 5000);
    }
  };

  useEffect(() => {
    if (user) fetchMyJobs();
  }, [user, fetchMyJobs]);

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
    <div className="flex min-h-screen bg-gray-50">
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-300 ease-in-out bg-white shadow-xl`}
      >
        <LeftSidebar worker={user} workinfo={user} isWorker={false} />
      </div>

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {error && (
          <div
            className={`fixed top-5 right-5 z-50 max-w-sm w-full animate-slide-in ${
              errorType === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : errorType === "warning"
                ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
                : "bg-blue-50 border border-blue-200 text-blue-700"
            } rounded-xl shadow-lg p-4`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 mt-0.5 ${
                  errorType === "error"
                    ? "text-red-500"
                    : errorType === "warning"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }`}
              >
                {errorType === "error" ? (
                  <FaExclamationTriangle className="w-5 h-5" />
                ) : errorType === "warning" ? (
                  <FaExclamationTriangle className="w-5 h-5" />
                ) : (
                  <FaInfoCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {errorType === "error"
                    ? "Error"
                    : errorType === "warning"
                    ? "Warning"
                    : "Information"}
                </p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className={`flex-shrink-0 ${
                  errorType === "error"
                    ? "text-red-400 hover:text-red-600"
                    : errorType === "warning"
                    ? "text-yellow-400 hover:text-yellow-600"
                    : "text-blue-400 hover:text-blue-600"
                } transition`}
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="fixed top-5 right-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-lg animate-slide-in z-50 max-w-sm">
            <div className="flex items-center space-x-2">
              <FaCheck className="w-4 h-4 text-green-600" />
              <span className="font-medium text-sm">{successMessage}</span>
            </div>
          </div>
        )}

        {showUrgentAlert && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center text-red-700">
              <FaExclamationTriangle className="w-5 h-5 mr-2" />
              <p className="font-medium text-sm">
                Need urgent worker immediately!
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-2xl w-12 h-12 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Welcome, {user?.fullName || "User"}!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage your jobs and find the right workers
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab("create")}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm transition-all flex-shrink-0 ${
                  activeTab === "create"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaPlus className="w-4 h-4" />
                <span>Hire Worker</span>
              </button>
              <button
                onClick={() => setActiveTab("jobs")}
                className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm transition-all flex-shrink-0 ${
                  activeTab === "jobs"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <FaList className="w-4 h-4" />
                <span>My Jobs ({jobs.length})</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "create" && (
              <form onSubmit={handleCreateJob} className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Title *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="e.g., Fix leaking bathroom faucet"
                          value={jobForm.title}
                          onChange={handleTitleChange}
                          onFocus={handleTitleFocus}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border ${
                            errors.title
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base`}
                          required
                        />
                        {showSuggestions && titleSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg sm:rounded-xl shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
                            {titleSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
                                onClick={() => selectSuggestion(suggestion)}
                              >
                                <p className="text-xs sm:text-sm text-gray-700">
                                  {suggestion}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {errors.title && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={jobForm.category}
                        onChange={handleCategoryChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border ${
                          errors.category
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base`}
                        required
                      >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        placeholder="Describe the job in detail..."
                        value={jobForm.description}
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            description: e.target.value,
                          })
                        }
                        rows="4"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border ${
                          errors.description
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base`}
                        required
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Price (रु) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={jobForm.priceRange.min}
                          onChange={(e) => handlePriceChange(e, "min")}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border ${
                            errors.minPrice
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base`}
                          required
                        />
                        {errors.minPrice && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.minPrice}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Price (रु) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="1000"
                          value={jobForm.priceRange.max}
                          onChange={(e) => handlePriceChange(e, "max")}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border ${
                            errors.maxPrice
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base`}
                          required
                        />
                        {errors.maxPrice && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.maxPrice}
                          </p>
                        )}
                      </div>
                    </div>
                    {errors.priceRange && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-700 text-xs sm:text-sm">
                          {errors.priceRange}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={jobForm.priority}
                          onChange={(e) =>
                            setJobForm({ ...jobForm, priority: e.target.value })
                          }
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deadline *
                        </label>
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={jobForm.deadline}
                          onChange={handleDeadlineChange}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border ${
                            errors.deadline
                              ? "border-red-300 bg-red-50"
                              : "border-gray-300"
                          } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base`}
                          required
                        />
                        {errors.deadline && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">
                            {errors.deadline}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        placeholder="Enter complete address with landmarks..."
                        value={jobForm.address}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, address: e.target.value })
                        }
                        rows="3"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border ${
                          errors.address
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm sm:text-base`}
                        required
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base"
                >
                  Post Job
                </button>
              </form>
            )}

            {activeTab === "jobs" && (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-gray-400 text-4xl sm:text-6xl mb-4">
                      No jobs
                    </div>
                    <p className="text-gray-500 text-sm sm:text-lg mb-4">
                      No jobs created yet
                    </p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                    >
                      Create Your First Job
                    </button>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job._id}
                      className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <FaMoneyBillWave className="text-green-500 w-3 h-3 sm:w-4 sm:h-4" />
                              <span>
                                रु{job.priceRange.initial} - रु
                                {job.priceRange.end}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaTag className="text-blue-500 w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{job.category}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FaClock className="text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                              <span>
                                {new Date(job.deadline).toLocaleDateString()}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => viewApplications(job._id)}
                            disabled={loadingApplications[job._id]}
                            className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-blue-100 transition text-xs sm:text-sm disabled:opacity-50"
                          >
                            {loadingApplications[job._id] ? (
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : openJobId === job._id ? (
                              <FaEyeSlash className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                            <span>({applications[job._id]?.length || 0})</span>
                          </button>

                          <button
                            onClick={() => setSelectedJob(job)}
                            className="bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-gray-200 transition text-xs sm:text-sm"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => setConfirmJobId(job._id)}
                            disabled={deletingJobId === job._id}
                            className="bg-red-50 text-red-600 px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-red-100 transition text-xs sm:text-sm disabled:opacity-50"
                          >
                            {deletingJobId === job._id ? (
                              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {openJobId === job._id && (
                        <div className="mt-3 sm:mt-4 border-t pt-3 sm:pt-4">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">
                            Applications
                          </h4>

                          {loadingApplications[job._id] ? (
                            <div className="text-center py-4">
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                              <p className="text-gray-500 text-sm mt-2">
                                Loading applications...
                              </p>
                            </div>
                          ) : !applications[job._id] ||
                            applications[job._id].length === 0 ? (
                            <div className="text-center py-4 sm:py-6 text-gray-500 text-sm sm:text-base">
                              No applications received yet
                            </div>
                          ) : (
                            <div className="space-y-2 sm:space-y-3">
                              {applications[job._id].map((app) => (
                                <div
                                  key={app._id}
                                  className="bg-gray-50 rounded-lg p-3 sm:p-4 border"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-medium text-xs sm:text-sm">
                                          {app.appliedBy?.fullName?.charAt(0) ||
                                            "U"}
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-gray-900 text-sm sm:text-base">
                                            {app.appliedBy?.fullName ||
                                              "Unknown User"}
                                          </h5>
                                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                                            <span className="flex items-center space-x-1">
                                              <FaPhone className="w-2 h-2 sm:w-3 sm:h-3" />
                                              <span>
                                                {app.appliedBy?.phoneNo ||
                                                  "N/A"}
                                              </span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                              <FaHome className="w-2 h-2 sm:w-3 sm:h-3" />
                                              <span>
                                                {app.appliedBy?.address ||
                                                  "N/A"}
                                              </span>
                                            </span>
                                            {app.estimatedPrice && (
                                              <span className="font-semibold text-green-600">
                                                रु {app.estimatedPrice} /-
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {app.message && (
                                        <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-700 bg-white rounded-lg p-2 sm:p-3 border">
                                          "{app.message}"
                                        </div>
                                      )}
                                    </div>

                                    <div className="sm:ml-4">
                                      {app.isAccepted ? (
                                        <span className="bg-green-100 text-green-600 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                                          Approved
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleApprove(job._id, app._id)
                                          }
                                          className="bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm w-full sm:w-auto"
                                        >
                                          Approve
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
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
      </main>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl border border-gray-200 mx-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Job Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <DetailItem
                icon={FaTag}
                label="Title"
                value={selectedJob.title}
              />
              <DetailItem
                icon={FaMoneyBillWave}
                label="Price"
                value={`रु${selectedJob.priceRange.initial} - रु${selectedJob.priceRange.end}`}
              />
              <DetailItem
                icon={FaTag}
                label="Category"
                value={selectedJob.category}
              />
              <DetailItem
                icon={FaRegFileAlt}
                label="Description"
                value={selectedJob.description}
              />
              <DetailItem
                icon={FaMapMarkerAlt}
                label="Address"
                value={selectedJob.address}
              />
              <DetailItem
                icon={FaClock}
                label="Deadline"
                value={new Date(selectedJob.deadline).toLocaleDateString()}
              />
              <DetailItem
                icon={FaBolt}
                label="Priority"
                value={
                  selectedJob.priority.charAt(0).toUpperCase() +
                  selectedJob.priority.slice(1)
                }
              />
            </div>
          </div>
        </div>
      )}

      {confirmJobId && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center shadow-2xl border border-gray-200 mx-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FaTrash className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Job?
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              This action cannot be undone.
            </p>

            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={() => setConfirmJobId(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 sm:py-3 rounded-lg hover:bg-gray-200 transition font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteJob(confirmJobId)}
                disabled={deletingJobId === confirmJobId}
                className="flex-1 bg-red-600 text-white py-2 sm:py-3 rounded-lg hover:bg-red-700 transition font-medium text-sm sm:text-base disabled:opacity-50"
              >
                {deletingJobId === confirmJobId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <Icon className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm text-gray-600 break-words">{value}</p>
    </div>
  </div>
);

export default UserDashboard;
