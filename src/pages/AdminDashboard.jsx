import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaProjectDiagram,
  FaCogs,
  FaChartPie,
  FaSignOutAlt,
    FaUsers,
    FaFilter,
    FaEnvelope,
    FaPhone,
    FaCalendarAlt,
    FaEye,
    FaChevronLeft,
    FaChevronRight,
  FaSearch,
  FaBriefcase,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = ({ user, handleLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Users & Jobs data
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("createdAt");
  const [filter, setFilter] = useState("");

  const backendUrl = "https://gigpoint-backend.onrender.com/";

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaChartPie /> },
    { id: "users", label: "Users", icon: <FaUser /> },
    { id: "jobs", label: "Jobs", icon: <FaProjectDiagram /> },
    { id: "settings", label: "Settings", icon: <FaCogs /> },
  ];

  // Stats for overview
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
  });

  // User role distribution data (for charts)
  const [userRoleData, setUserRoleData] = useState({
    workers: 0,
    clients: 0,
    admins: 0,
  });

  // Fetch Stats for Overview
  useEffect(() => {
    if (activeTab !== "overview") return;

    const fetchStats = async () => {
      try {
        // Fetch stats from your API
        const [statsRes, usersRes] = await Promise.all([
          fetch(`${backendUrl}admin/stats`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }),
          fetch(`${backendUrl}admin/viewAll?page=1&perPage=1000`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalUsers: statsData.totalUsers || 0,
            totalJobs: statsData.totalJobs || 0,
            activeJobs: statsData.activeJobs || 0,
            pendingJobs: statsData.pendingJobs || 0,
          });
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();

          // Calculate role distribution from actual user data
          if (usersData.data && usersData.data.length) {
            const workers = usersData.data.filter(
              (user) => user.role === "worker"
            ).length;
            const clients = usersData.data.filter(
              (user) => user.role === "client"
            ).length;
            const admins = usersData.data.filter(
              (user) => user.role === "admin"
            ).length;

            setUserRoleData({
              workers,
              clients,
              admins,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 1248,
          totalJobs: 567,
          activeJobs: 432,
          pendingJobs: 23,
        });

        setUserRoleData({
          workers: 850,
          clients: 350,
          admins: 48,
        });
      }
    };

    fetchStats();
  }, [activeTab, backendUrl]);

  // Fetch Users
  useEffect(() => {
    if (activeTab !== "users") return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          perPage: perPage.toString(),
          sortOption,
          filter: filter
            ? JSON.stringify([{ field: "fullName", value: filter }])
            : "[]",
        });

        const res = await fetch(
          `${backendUrl}admin/viewAll?${query.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) {
          setUsers(data.data);
          setTotalPages(Math.ceil(data.data.length / perPage));
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, page, perPage, sortOption, filter, backendUrl]);

  // Fetch Jobs
  useEffect(() => {
    if (activeTab !== "jobs") return;

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          perPage: perPage.toString(),
          sortOption,
          filter: filter
            ? JSON.stringify([{ field: "title", value: filter }])
            : "[]",
        });

        const res = await fetch(`${backendUrl}admin/jobs?${query.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setJobs(data.data.jobs);
          setTotalPages(Math.ceil(data.data.total / perPage));
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [activeTab, page, perPage, sortOption, filter, backendUrl]);

  // Pagination
  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Data for user role distribution chart
  const userRoleChartData = {
    labels: ["Workers", "Clients", "Admins"],
    datasets: [
      {
        data: [userRoleData.workers, userRoleData.clients, userRoleData.admins],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 99, 132, 0.7)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Data for user growth chart (example - you might need to fetch historical data)
  const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Users",
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "User Role Distribution",
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "User Growth (Last 6 Months)",
      },
    },
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-700 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FaCogs className="text-sm" />
          </div>
          Admin Panel
        </div>

        <ul className="flex-1 mt-6">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer rounded-r-lg mb-1 transition-all
              ${
                activeTab === tab.id
                  ? "bg-indigo-700 font-semibold border-l-4 border-white"
                  : "hover:bg-indigo-700"
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
                setFilter("");
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </li>
          ))}
        </ul>

        <div className="p-6 border-t border-indigo-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <FaUser className="text-white" />
              )}
            </div>
            <div className="flex-1 truncate">
              <p className="font-medium truncate">
                {user?.fullName || "Admin"}
              </p>
              <p className="text-xs text-indigo-200 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 transition-colors text-white font-medium"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {activeTab === "overview" ? "Dashboard Overview" : activeTab}
          </h1>
          <div className="text-gray-600">
            Welcome, {user?.fullName || "Admin"}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          {/* Overview */}
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Dashboard Overview
              </h2>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Total Users</h3>
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                      <FaUsers />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalUsers}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +12% from last month
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Total Jobs</h3>
                    <div className="p-3 rounded-lg bg-green-100 text-green-600">
                      <FaBriefcase />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.totalJobs}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    +8% from last month
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Active Jobs</h3>
                    <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                      <FaProjectDiagram />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.activeJobs}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    76% of total jobs
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 font-medium">Pending Jobs</h3>
                    <div className="p-3 rounded-lg bg-red-100 text-red-600">
                      <FaCogs />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.pendingJobs}
                  </p>
                  <p className="text-sm text-red-600 mt-1">Needs attention</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <Doughnut
                    data={userRoleChartData}
                    options={doughnutOptions}
                  />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <Bar data={userGrowthData} options={barOptions} />
                </div>
              </div>

              {/* User Statistics */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  User Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-blue-600 font-bold text-2xl mb-1">
                      {userRoleData.workers}
                    </div>
                    <div className="text-blue-800 font-medium">Workers</div>
                    <div className="text-blue-600 text-sm">
                      {stats.totalUsers
                        ? `${(
                            (userRoleData.workers / stats.totalUsers) *
                            100
                          ).toFixed(1)}% of total`
                        : "0%"}
                    </div>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="text-teal-600 font-bold text-2xl mb-1">
                      {userRoleData.clients}
                    </div>
                    <div className="text-teal-800 font-medium">Clients</div>
                    <div className="text-teal-600 text-sm">
                      {stats.totalUsers
                        ? `${(
                            (userRoleData.clients / stats.totalUsers) *
                            100
                          ).toFixed(1)}% of total`
                        : "0%"}
                    </div>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg">
                    <div className="text-pink-600 font-bold text-2xl mb-1">
                      {userRoleData.admins}
                    </div>
                    <div className="text-pink-800 font-medium">Admins</div>
                    <div className="text-pink-600 text-sm">
                      {stats.totalUsers
                        ? `${(
                            (userRoleData.admins / stats.totalUsers) *
                            100
                          ).toFixed(1)}% of total`
                        : "0%"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  Users Management
                </h2>
                <div className="text-sm text-gray-500">
                  {users.length} users found
                </div>
              </div>

              {/* Filter & Sort */}
              <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1 max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name..."
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="fullName">Name (A-Z)</option>
                    <option value="email">Email</option>
                  </select>

                  <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                    <FaFilter /> Filters
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaUser className="text-3xl text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">
                        No users found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search or filter to find what you're
                        looking for.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-left text-gray-600 font-medium">
                              User
                            </th>
                            <th className="py-3 px-4 text-left text-gray-600 font-medium">
                              Contact
                            </th>
                            <th className="py-3 px-4 text-left text-gray-600 font-medium">
                              Role
                            </th>
                            <th className="py-3 px-4 text-left text-gray-600 font-medium">
                              Joined
                            </th>
                            <th className="py-3 px-4 text-left text-gray-600 font-medium">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr
                              key={user._id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {user.profilePicture ? (
                                      <img
                                        src={user.profilePicture}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <FaUser className="text-gray-600" />
                                    )}
                                  </div>
                                  <span className="font-medium">
                                    {user.fullName}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <FaEnvelope className="text-gray-400" />
                                    {user.email}
                                  </div>
                                  {user.phoneNo && (
                                    <div className="flex items-center gap-2 text-gray-700 mt-1">
                                      <FaPhone className="text-gray-400" />
                                      {user.phoneNo}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    user.role === "admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : user.role === "employer"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FaCalendarAlt className="text-gray-400" />
                                  {formatDate(user.createdAt)}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                                  <FaEye /> View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* Pagination */}
              {users.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {(page - 1) * perPage + 1} to{" "}
                    {Math.min(page * perPage, users.length)} of {users.length}{" "}
                    results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="text-xs" /> Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg border ${
                              page === pageNum
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === "jobs" && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  Jobs Management
                </h2>
                <div className="text-sm text-gray-500">
                  {jobs.length} jobs found
                </div>
              </div>

              {/* Filter & Sort */}
              <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1 max-w-md">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs by title..."
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="status">Status</option>
                  </select>

                  <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                    <FaFilter /> Filters
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {jobs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaBriefcase className="text-3xl text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">
                        No jobs found
                      </h3>
                      <p className="text-gray-500">
                        Try adjusting your search or filter to find what you're
                        looking for.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {jobs.map((job) => (
                        <div
                          key={job._id}
                          className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">
                                {job.title}
                              </h3>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  job.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : job.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {job.status}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {job.description}
                            </p>
                            <div className="text-sm text-gray-500 mb-4">
                              <p className="truncate">{job.address}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <FaCalendarAlt className="text-gray-400" />
                                <span>
                                  Created: {formatDate(job.createdAt)}
                                </span>
                              </div>
                            </div>

                            {job.createdBy && (
                              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                  {job.createdBy.profilePicture ? (
                                    <img
                                      src={job.createdBy.profilePicture}
                                      alt={job.createdBy.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FaUser className="text-gray-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 truncate">
                                    {job.createdBy.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    Posted by
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="px-5 py-3 bg-gray-50 flex justify-end">
                            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Pagination */}
              {jobs.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {(page - 1) * perPage + 1} to{" "}
                    {Math.min(page * perPage, jobs.length)} of {jobs.length}{" "}
                    results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaChevronLeft className="text-xs" /> Previous
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg border ${
                              page === pageNum
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={page === totalPages}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Settings
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-gray-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    General Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Email Notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Dark Mode</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Auto Refresh</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-5 border border-gray-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Account Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        defaultValue={user?.fullName || "Admin"}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={user?.email || "admin@example.com"}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
