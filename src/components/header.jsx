import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useUser } from "../context/UserContextProvider.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const backendUrl = import.meta.env.VITE_BASE_URL;

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, setUser, loading } = useUser();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navigate = useNavigate();

  const handleLogout = () => {
    fetch(`${backendUrl}auth/logout`, {
      method: "POST",
      credentials: "include",
    })
      .then(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("theme");
        localStorage.removeItem("workerPosts");

        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("@@auth0spajs@@")) {
            localStorage.removeItem(key);
          }
        });

        setUser(null);
      })
      .finally(() => navigate("/login"));
  };

  if (loading) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          Loading...
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Logo />
          <div className="flex flex-1 mx-4 md:mx-8">
            <SearchBar user={user} navigate={navigate} />
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <NavigationLinks user={user} handleLogout={handleLogout} />
          </div>

          <button
            className="md:hidden text-2xl text-blue-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-4 py-4">
            <SearchBar user={user} navigate={navigate} />
            <NavigationLinks user={user} handleLogout={handleLogout} isMobile />
          </div>
        )}
      </div>
    </header>
  );
};

const Logo = () => (
  <Link to="/" className="flex items-center space-x-2">
    <i className="fas fa-bolt text-blue-600 text-3xl"></i>
    <span className="text-2xl font-extrabold text-blue-600 font-serif">
      GigPoint
    </span>
  </Link>
);

const SearchBar = ({ user, navigate }) => {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setJobs([]);
      setShowResults(false);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoadingJobs(true);

      try {
        let res;

        if (user?.role === "worker") {
          res = await fetch(
            `${backendUrl}job/searchJob?title=${query}`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
        } else {
          res = await fetch(`${backendUrl}auth/search`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify({
              filter: [{ key: "fullName", value: query }],
            }),
          });
        }

        const data = await res.json();
        setJobs(data.data?.result || []);
        setShowResults(true);
      } catch (err) {
        console.error(err);
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    }, 400);

    return () => clearTimeout(debounce);
  }, [query]);

  const fetchJobDetails = async (jobId) => {
    setErrorMessage("");
    setLoadingJobDetails(true);
    try {
      const res = await fetch(`${backendUrl}job/get/${jobId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await res.json();

      if (!data.data) {
        setErrorMessage("Job not found or it may have been removed.");
        setSelectedJob(null);
        return;
      }

      setSelectedJob(data.data);
      setShowResults(false);
    } catch (err) {
      console.error(err);
      setSelectedJob(null);
    } finally {
      setLoadingJobDetails(false);
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    setErrorMessage("");

    if (!user || !user.skills) {
      setErrorMessage(
        "You are not eligible for this job to apply. Please select a job related to your skills."
      );
      return;
    }

    if (!selectedJob || !selectedJob.category) {
      setErrorMessage("No job selected or job category missing.");
      return;
    }

    const jobCategories = selectedJob.category
      .toLowerCase()
      .split(",")
      .map((c) => c.trim());
    const userSkills = user.skills.map((skill) => skill.toLowerCase().trim());

    const isMatch = jobCategories.some((cat) => userSkills.includes(cat));

    if (!isMatch) {
      setErrorMessage(
        "**You are not eligible for this job to apply. Please select a job related to your skills.**"
      );
      return;
    }

    navigate(`/worker-dashboard/apply/${selectedJob._id}`);
    closeModal();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeModal = () => {
    setSelectedJob(null);
    setQuery("");
    setJobs([]);
    setErrorMessage("");
  };

  const handleWorkerClick = (worker) => {
    setSelectedWorker(worker);
    setShowResults(false);
    setShowContact(false);
  };

  const handleContactClick = () => {
    setShowContact(true);
  };

  const handleCloseWorkerModal = () => {
    setSelectedWorker(null);
    setShowContact(false);
  };

  const getStatusInfo = (worker) => {
    const isActive = worker.isAvailable !== false;
    const lastActive = worker.updatedAt || worker.createdAt;
    const profilePicture = worker.profilePicture; // URL of the image

    return {
      isActive,
      statusText: isActive ? "Active Now" : "Offline",
      statusColor: isActive ? "text-green-600" : "text-gray-500",
      statusBg: isActive ? "bg-green-100" : "bg-gray-100",
      // Return either the image URL or the fallback icon component
      statusIcon: profilePicture || FaTimesCircle,
      lastActive: lastActive
        ? new Date(lastActive).toLocaleDateString()
        : "Recently",
    };
  };

  return (
    <div className="relative w-full max-w-full md:max-w-xl" ref={dropdownRef}>
      <div className="relative w-full">
        <div className="flex items-center relative">
          <input
            type="text"
            placeholder="Search services, jobs, gigs..."
            value={query}
            onChange={(e) => {
              setErrorMessage("");
              setQuery(e.target.value);
              setSelectedJob(null);
            }}
            onFocus={() => jobs.length > 0 && setShowResults(true)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {loadingJobs ? (
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute z-40 mt-1 w-full bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-gray-200/50 overflow-hidden">
            {loadingJobs ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="py-1 max-h-96 overflow-y-auto">
                  {jobs.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => {
                        if (user?.role === "worker") {
                          fetchJobDetails(item._id);
                        } else {
                          handleWorkerClick(item);
                        }
                      }}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {user?.role === "worker"
                                ? item.title
                                : item.fullName}
                            </h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user?.role === "worker" ? (
                                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {item.category}
                                </span>
                              ) : (
                                item.skills?.slice(0, 3).map((s, i) => (
                                  <span
                                    key={i}
                                    className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                                  >
                                    {s}
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                        {user?.role !== "worker" && (
                          <div className="flex flex-col items-end">
                            {getStatusInfo(item).isActive ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaCheckCircle className="mr-1" size={10} />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <FaTimesCircle className="mr-1" size={10} />
                                Offline
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-500 border-t border-gray-200">
                  {jobs.length} {jobs.length === 1 ? "result" : "results"} found
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto w-24 h-24 text-gray-400 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700">
                  No {user?.role === "worker" ? "jobs" : "workers"} found
                </h3>
                <p className="mt-1 text-gray-500">
                  Try different search terms or check back later
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <>
          <div className="fixed inset-0 bg-blend-color-burn bg-opacity-80 backdrop-blur-sm z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 transform transition-all">
              <div className="p-6">
                {loadingJobDetails ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          {selectedJob.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedJob.status === "searching"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {selectedJob.status}
                          </span>
                          {selectedJob.priority && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {selectedJob.priority} priority
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-gray-700">
                            Location
                          </h3>
                          <p className="mt-1 text-gray-900">
                            {selectedJob.address}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-700">
                            Price Range
                          </h3>
                          <p className="mt-1 text-green-600 font-medium">
                            NPR {selectedJob.priceRange?.initial} -{" "}
                            {selectedJob.priceRange?.end}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-700">
                          Description
                        </h3>
                        <p className="mt-1 text-gray-900 whitespace-pre-line">
                          {selectedJob.description || "No description provided"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-gray-700">
                            Posted On
                          </h3>
                          <p className="mt-1 text-gray-900">
                            {new Date(
                              selectedJob.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-700">
                            Last Updated
                          </h3>
                          <p className="mt-1 text-gray-900">
                            {new Date(
                              selectedJob.updatedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="mb-4 text-red-600 font-semibold">
                        {errorMessage}
                      </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        onClick={handleApply}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Apply Now
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Worker Profile Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Worker Profile
                </h2>
                <button
                  onClick={handleCloseWorkerModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                {/* Profile Image and Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
                    {selectedWorker.profilePicture ? (
                      <img
                        src={selectedWorker.profilePicture}
                        alt={selectedWorker.name || "Profile"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="text-blue-600 text-2xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedWorker.name ||
                        selectedWorker.fullName ||
                        "Unknown User"}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusInfo(selectedWorker).statusBg
                        } ${getStatusInfo(selectedWorker).statusColor}`}
                      >
                        {getStatusInfo(selectedWorker).isActive ? (
                          <>
                            <FaCheckCircle className="mr-1" size={10} />
                            Active Now
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="mr-1" size={10} />
                            Offline
                          </>
                        )}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <FaClock className="mr-1" size={10} />
                        Last active: {getStatusInfo(selectedWorker).lastActive}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {selectedWorker.address && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <FaMapMarkerAlt
                        className="text-gray-400 mt-0.5"
                        size={14}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Address
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedWorker.address}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills */}
                {selectedWorker.skills?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedWorker.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information - Initially Hidden */}
                {showContact ? (
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">
                      Contact Information
                    </p>

                    {/* Phone Number */}
                    {selectedWorker.phoneNo && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <FaPhone className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Phone
                          </p>
                          <a
                            href={`tel:${selectedWorker.phoneNo}`}
                            className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                          >
                            {selectedWorker.phoneNo}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {selectedWorker.email && (
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <FaEnvelope className="text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Email
                          </p>
                          <a
                            href={`mailto:${selectedWorker.email}`}
                            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                          >
                            {selectedWorker.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {!selectedWorker.phoneNo && !selectedWorker.email && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No contact information available
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 text-center mb-3">
                      Contact information is hidden for privacy
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCloseWorkerModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>

                {!showContact ? (
                  <button
                    onClick={handleContactClick}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <FaPhone size={14} />
                    <span>Contact</span>
                  </button>
                ) : (
                  <div className="flex-1 flex space-x-2">
                    {selectedWorker.phoneNo && (
                      <a
                        href={`tel:${selectedWorker.phoneNo}`}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <FaPhone size={14} />
                        <span>Call</span>
                      </a>
                    )}
                    {selectedWorker.email && (
                      <a
                        href={`mailto:${selectedWorker.email}`}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <FaEnvelope size={14} />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavigationLinks = ({ user, handleLogout, isMobile }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const dashboardPath = (() => {
    if (!user || !user.role) return "/dashboard";
    if (user.role === "worker") return "/worker-dashboard";
    if (user.role === "user") return "/user-dashboard";
    return "/dashboard";
  })();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: dashboardPath, label: "Dashboard" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`flex ${
        isMobile ? "flex-col space-y-3 px-2" : "space-x-12 items-center"
      }`}
    >
      {links.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive
              ? "text-blue-600 font-medium flex items-center space-x-1"
              : "text-gray-700 hover:text-blue-600 font-medium flex items-center space-x-1"
          }
        >
          <span>{label}</span>
        </NavLink>
      ))}

      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "P"}
              </div>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute bg-white shadow-md rounded border mt-2 right-0 w-44 z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  if (user.role === "worker") {
                    navigate("/update-profile");
                  } else {
                    navigate("/update-profile-user");
                  }
                }}
                className="w-full text-left px-4 py-2 hover:bg-indigo-100 cursor-pointer"
              >
                Update Profile
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `px-4 py-2 rounded-full font-medium transition ${
              isActive
                ? "bg-blue-700 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`
          }
        >
          Login
        </NavLink>
      )}
    </nav>
  );
};

export default Header;
