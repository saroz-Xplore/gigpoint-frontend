import React from 'react';
import { Link } from 'react-router-dom';

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
    <i className="fas fa-bolt text-blue-600 text-2xl"></i>
    <span className="text-xl font-bold text-blue-600">GigPoint</span>
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
    <Link to="/home" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
    <Link to="/how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">How It Works</Link>
    <AccountDropdown />
    <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition font-medium">
      Login/Signup
    </Link>
  </nav>
);

const AccountDropdown = () => (
  <div className="relative group">
    <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium">
      <span>Account</span>
      <i className="fas fa-chevron-down text-xs"></i>
    </button>
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
      <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-blue-50 text-gray-700">Dashboard</Link>
    </div>
  </div>
);

export default Header;
