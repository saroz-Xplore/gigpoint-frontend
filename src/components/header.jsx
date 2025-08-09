import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useUser } from "../context/UserContextProvider.jsx";

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
            <SearchBar />
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
            <SearchBar />
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
    <span className="text-2xl font-extrabold text-blue-600 font-serif">GigPoint</span>
  </Link>
);

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingJobDetails, setLoadingJobDetails] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setJobs([]);
      setSelectedJob(null);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoadingJobs(true);
      try {
        const res = await fetch(
          `${backendUrl}job/searchJob?title=${encodeURIComponent(query)}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const data = await res.json();
        setJobs(data.data?.result || []);
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
      setSelectedJob(data.data);
      setJobs([]);
      setQuery(data.data.title);
    } catch (err) {
      console.error(err);
      setSelectedJob(null);
    } finally {
      setLoadingJobDetails(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setJobs([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
  <div className="relative w-full max-w-full md:max-w-xl flex flex-col px-2 md:px-0" ref={dropdownRef}>
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search for services..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedJob(null);
        }}
        className="w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {loadingJobs && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
        </div>
      )}
    </div>

    {!loadingJobs && jobs.length > 0 && (
      <ul className="absolute z-50 bg-white border border-gray-300 rounded-b-md shadow w-full max-h-64 overflow-auto mt-1 top-full left-0">
        {jobs.map((job) => (
            <li
              key={job._id}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => fetchJobDetails(job._id)}  
            >
              <div className="flex justify-between">
                <span className="font-semibold">{job.title}</span>
                <span className="italic text-gray-600">{job.status}</span>
              </div>
            </li>
        ))}
      </ul>
    )}

    {selectedJob && (
      <div className="relative mt-4 p-6 bg-white rounded-lg shadow-lg border border-blue-300 space-y-3">
        <button
          onClick={() => setSelectedJob(null)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
          aria-label="Close selected job"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-blue-700">{selectedJob.title}</h3>
        <p className="italic text-gray-700">{selectedJob.description}</p>

        <div className="flex flex-wrap gap-4 text-gray-800">
          <div><strong>Category:</strong> {selectedJob.category || "N/A"}</div>
          <div><strong>Status:</strong> {selectedJob.status || "N/A"}</div>
          <div><strong>Priority:</strong> {selectedJob.priority || "N/A"}</div>
        </div>

        <div>
          <strong>Price Range:</strong>{" "}
          <span className="text-green-600 font-semibold">
            NPR {selectedJob.priceRange?.initial ?? "N/A"} - {selectedJob.priceRange?.end ?? "N/A"}
          </span>
        </div>
      </div>
    )}
  </div>
);


}

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
    <nav className={`flex ${isMobile ? "flex-col space-y-3 px-2" : "space-x-12 items-center"}`}>
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
            className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {user.fullName ? user.fullName.split(" ")[0] : "Profile"}
          </button>

          {dropdownOpen && (
            <div className="absolute bg-white shadow-md rounded border mt-2 right-0 w-44 z-50">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/update-profile");
                }}
                className="w-full text-left px-4 py-2 hover:bg-indigo-100"
              >
                Update Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
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
              isActive ? "bg-blue-700 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
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
