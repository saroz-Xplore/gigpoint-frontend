import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Logo />
          <SearchBar />
          <NavigationLinks />
        </div>
      </div>
    </header>
  );
};

const Logo = () => (
  <Link to="/" className="flex items-center space-x-2">
    <i className="fas fa-bolt text-blue-600 text-3xl"></i>
    <span className="text-2xl font-extrabold text-blue-600 tracking-wide font-serif">
      GigPoint
    </span>
  </Link>
);

const SearchBar = () => (
  <div className="hidden md:flex flex-1 mx-8">
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

const NavigationLinks = () => (
  <nav className="hidden md:flex items-center space-x-12">
    <NavLink
      to="/"
      className={({ isActive }) =>
        isActive
          ? 'text-blue-600 font-medium'
          : 'text-gray-700 hover:text-blue-600 font-medium'
      }
    >
      Home
    </NavLink>

    <NavLink
      to="/about"
      className={({ isActive }) =>
        isActive
          ? 'text-blue-600 font-medium'
          : 'text-gray-700 hover:text-blue-600 font-medium'
      }
    >
      About Us
    </NavLink>

    {/* Replaced Dropdown with Simple Link */}
    <NavLink
      to="/dashboard"
      className={({ isActive }) =>
        isActive
          ? 'text-blue-600 font-medium'
          : 'text-gray-700 hover:text-blue-600 font-medium'
      }
    >
      Dashboard
    </NavLink>

    <NavLink
      to="/login"
      className={({ isActive }) =>
        `px-4 py-2 rounded-full font-medium transition ${
          isActive
            ? 'bg-blue-700 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`
      }
    >
      Login
    </NavLink>
  </nav>
);


export default Header;
