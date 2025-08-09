import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useUser } from "../context/UserContextProvider.jsx";

const backendUrl = import.meta.env.VITE_BASE_URL;

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, setUser, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
  fetch(`${backendUrl}auth/logout`, {
    method: "POST",
    credentials: "include",
  })
    .then(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('theme');
      localStorage.removeItem('workerPosts');

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('@@auth0spajs@@')) {
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
          <div className="hidden md:flex flex-1 mx-8">
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

const SearchBar = () => (
  <div className="w-full px-2">
    <div className="relative w-full max-w-xl">
      <input
        type="text"
        placeholder="Search for services..."
        className="w-full py-2 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-blue-600">
        <i className="fas fa-search"></i>
      </button>
    </div>
  </div>
);

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
