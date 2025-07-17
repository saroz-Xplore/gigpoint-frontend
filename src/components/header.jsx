import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Logo />
          <div className="hidden md:flex flex-1 mx-8">
            <SearchBar />
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <NavigationLinks />
          </div>

          {/* Hamburger Icon */}
          <button
            className="md:hidden text-2xl text-blue-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col space-y-4 py-4">
            <SearchBar />
            <NavigationLinks isMobile />
          </div>
        )}
      </div>
    </header>
  );
};

const Logo = () => (
  <Link to="/" className="flex items-center space-x-2 relative overflow-hidden">
    <i className="fas fa-bolt text-blue-600 text-3xl"></i>
    <span className="text-2xl font-extrabold text-blue-600 tracking-wide font-serif shimmer-text relative">
      GigPoint
    </span>
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

const NavigationLinks = ({ isMobile }) => (
  <nav
    className={`flex ${
      isMobile ? "flex-col space-y-3 px-2" : "space-x-12 items-center"
    }`}
  >
    {[
      { to: "/", label: "Home" },
      { to: "/about", label: "About Us" },
      { to: "/dashboard", label: "Dashboard" },
    ].map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          isActive
            ? "text-blue-600 font-medium"
            : "text-gray-700 hover:text-blue-600 font-medium"
        }
      >
        {label}
      </NavLink>
    ))}

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
  </nav>
);

export default Header;
