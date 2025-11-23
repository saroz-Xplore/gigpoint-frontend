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
  FaPlayCircle,
  FaSyncAlt,
  FaMoneyBillWave,
  FaTrash,
  FaBars,
  FaTimes,
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
import { UserCard } from "../components/UserCard";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Users & Jobs data
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOption, setSortOption] = useState("createdAt");
  const [filter, setFilter] = useState("");

  const backendUrl = import.meta.env.VITE_BASE_URL;

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaChartPie /> },
    { id: "users", label: "Users", icon: <FaUser /> },
    { id: "jobs", label: "Jobs", icon: <FaProjectDiagram /> },
    { id: "stats", label: "Stats", icon: <FaCogs /> },
  ];

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [removeMessage, setRemoveMessage] = useState("");
  const [removing, setRemoving] = useState(false);

  const [showRemoveJobModal, setShowRemoveJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [removeJobMessage, setRemoveJobMessage] = useState("");
  const [removingJob, setRemovingJob] = useState(false);

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

  //for stats
  const [topWorkers, setTopWorkers] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Close sidebar when tab changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [activeTab]);

  // Fetch Stats for Overview
  useEffect(() => {
    if (activeTab !== "overview") return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${backendUrl}admin/dash`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const dashboardData = data.data;

            setStats({
              totalUsers: dashboardData.totalUser,
              totalJobs: dashboardData.totalJobs,
              activeJobs: dashboardData.activeJobs,
              ongoingJobs: dashboardData.ongoingJobs,
              totalTransaction: dashboardData.totalTransaction,
            });

            setUserRoleData({
              workers: dashboardData.totalWorker,
              customers: dashboardData.totalCustomers,
              admins: dashboardData.totalAdmin,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Fallback mock data
        setStats({
          totalUsers: 23,
          totalJobs: 16,
          activeJobs: 13,
          ongoingJobs: 3,
        });
        setUserRoleData({
          workers: 10,
          customers: 12,
          admins: 1,
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

  // Fetch Stats Data
  useEffect(() => {
    if (activeTab !== "stats") return;

    const fetchTopData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        };

        const [workerRes, customerRes] = await Promise.all([
          fetch(`${backendUrl}admin/topW`, { headers }),
          fetch(`${backendUrl}admin/topU`, { headers }),
        ]);

        if (workerRes.ok) {
          const data = await workerRes.json();
          setTopWorkers(data.data || []);
        }
        if (customerRes.ok) {
          const data = await customerRes.json();
          setTopCustomers(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching stats data:", err);
      }
    };
    fetchTopData();

    if (!autoRefresh) return;

    const interval = setInterval(fetchTopData, 10000);
    return () => clearInterval(interval);
  }, [activeTab, backendUrl, autoRefresh]);

  // Pagination
  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-100 to-blue-50 text-blue-900 flex flex-col shadow-lg transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 text-2xl font-bold border-b border-blue-200 flex justify-between items-center">
          <span>Admin Panel</span>
          <button
            className="md:hidden text-blue-900"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs */}
        <ul className="flex-1 mt-6">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={`flex items-center gap-3 px-6 py-3 cursor-pointer rounded-r-full mb-2 transition-all
                ${
                  activeTab === tab.id
                    ? "bg-blue-400 text-white font-semibold shadow-md"
                    : "hover:bg-blue-200"
                }`}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
                setFilter("");
                if (window.innerWidth < 768) {
                  setIsSidebarOpen(false);
                }
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-2xl text-blue-600"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Menu"
            >
              <FaBars />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 capitalize">
              {activeTab === "overview" ? "Dashboard Overview" : activeTab}
            </h1>
          </div>
          <div className="text-gray-600 text-sm md:text-base">
            Welcome, {user?.fullName || "Admin"}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 p-3 md:p-6 overflow-auto bg-gray-50">
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="p-2 md:p-4 flex flex-col gap-3 bg-gray-50">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
                {[
                  {
                    icon: (
                      <FaUsers className="text-blue-500 text-lg md:text-3xl" />
                    ),
                    label: "Total Users",
                    value: stats.totalUsers,
                  },
                  {
                    icon: (
                      <FaBriefcase className="text-green-500 text-lg md:text-3xl" />
                    ),
                    label: "Total Jobs",
                    value: stats.totalJobs,
                  },
                  {
                    icon: (
                      <FaPlayCircle className="text-purple-500 text-lg md:text-3xl" />
                    ),
                    label: "Active Jobs",
                    value: stats.activeJobs,
                  },
                  {
                    icon: (
                      <FaSyncAlt className="text-orange-500 text-lg md:text-3xl" />
                    ),
                    label: "Ongoing Jobs",
                    value:
                      stats.ongoingJobs === undefined
                        ? "0"
                        : `${stats.ongoingJobs}`,
                  },
                  {
                    icon: (
                      <FaMoneyBillWave className="text-indigo-500 text-lg md:text-3xl" />
                    ),
                    label: "Transactions",
                    value:
                      stats.totalTransaction === undefined
                        ? "0000"
                        : `Rs.${stats.totalTransaction}`,
                  },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-white shadow rounded-lg md:rounded-xl p-2 md:p-3 flex flex-col items-center justify-center hover:shadow-md transition duration-300"
                  >
                    {card.icon}
                    <h3 className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-1 text-center">
                      {card.label}
                    </h3>
                    <p className="text-xs md:text-lg font-bold text-gray-800">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bar Graph + Legend */}
              <div className="bg-white shadow rounded-lg md:rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-center gap-3 flex-grow">
                {/* Bar Graph */}
                <div className="w-full md:w-4/5 h-48 md:h-72">
                  <Bar
                    data={{
                      labels: ["Admins", "Workers", "Customers"],
                      datasets: [
                        {
                          label: "Users Count",
                          data: [
                            userRoleData.admins,
                            userRoleData.workers,
                            userRoleData.customers,
                          ],
                          backgroundColor: ["#3B82F6", "#10B981", "#F97316"],
                          borderRadius: 6,
                          maxBarThickness: 40,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true },
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 10 } },
                        },
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1, font: { size: 10 } },
                          grid: { drawBorder: false },
                        },
                      },
                    }}
                  />
                </div>

                {/* Legend */}
                <div className="flex flex-row md:flex-col gap-2 md:gap-3 justify-center items-center md:items-start text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-sm"></span>
                    <span>Admins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-sm"></span>
                    <span>Workers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 md:w-3 md:h-3 bg-orange-500 rounded-sm"></span>
                    <span>Customers</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                  Users Management
                </h2>
                <div className="text-sm text-gray-500">
                  {users.length} users found
                </div>
              </div>

              {/* Filter & Sort */}
              <div className="mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name..."
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full md:w-auto px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="fullName">Name (A-Z)</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8 md:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {users.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaUser className="text-xl md:text-3xl text-gray-400" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-gray-800 mb-1">
                        No users found
                      </h3>
                      <p className="text-gray-500 text-sm md:text-base">
                        Try adjusting your search or filter to find what you're
                        looking for.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-2 md:py-3 px-2 md:px-4 text-left text-gray-600 font-medium text-sm md:text-base">
                              User
                            </th>
                            <th className="py-2 md:py-3 px-2 md:px-4 text-left text-gray-600 font-medium text-sm md:text-base">
                              Contact
                            </th>
                            <th className="py-2 md:py-3 px-2 md:px-4 text-left text-gray-600 font-medium text-sm md:text-base">
                              Role
                            </th>
                            <th className="py-2 md:py-3 px-2 md:px-4 text-left text-gray-600 font-medium text-sm md:text-base">
                              Joined
                            </th>
                            <th className="py-2 md:py-3 px-2 md:px-4 text-left text-gray-600 font-medium text-sm md:text-base">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr
                              key={user._id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-2 md:py-3 px-2 md:px-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    {user.profilePicture ? (
                                      <img
                                        src={user.profilePicture}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <FaUser className="text-gray-600 text-sm md:text-base" />
                                    )}
                                  </div>
                                  <span className="font-medium text-sm md:text-base">
                                    {user.fullName}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-4">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1 md:gap-2 text-gray-700 text-xs md:text-sm">
                                    <FaEnvelope className="text-gray-400 text-xs" />
                                    <span className="truncate">
                                      {user.email}
                                    </span>
                                  </div>
                                  {user.phoneNo && (
                                    <div className="flex items-center gap-1 md:gap-2 text-gray-700 mt-1 text-xs md:text-sm">
                                      <FaPhone className="text-gray-400 text-xs" />
                                      {user.phoneNo}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-4">
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
                              <td className="py-2 md:py-3 px-2 md:px-4">
                                <div className="flex items-center gap-1 md:gap-2 text-gray-600 text-xs md:text-sm">
                                  <FaCalendarAlt className="text-gray-400 text-xs" />
                                  {formatDate(user.createdAt)}
                                </div>
                              </td>
                              <td className="py-2 md:py-3 px-2 md:px-4 flex gap-2 md:gap-3">
                                <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs md:text-sm">
                                  <FaEye className="text-xs" /> View
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowRemoveModal(true);
                                  }}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs md:text-sm"
                                >
                                  <FaTrash className="text-xs" /> Remove
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

              {/* Remove User Modal */}
              {showRemoveModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                      Remove {selectedUser.fullName}?
                    </h2>
                    <p className="text-gray-600 mb-3 text-sm md:text-base">
                      Please provide a message for the user:
                    </p>
                    <textarea
                      rows={3}
                      value={removeMessage}
                      onChange={(e) => setRemoveMessage(e.target.value)}
                      placeholder="Enter reason..."
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm md:text-base"
                    />

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowRemoveModal(false);
                          setSelectedUser(null);
                          setRemoveMessage("");
                        }}
                        className="px-3 md:px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm md:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setRemoving(true);
                          try {
                            const res = await fetch(
                              `${backendUrl}admin/removeUser/${selectedUser._id}`,
                              {
                                method: "DELETE",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "accessToken"
                                  )}`,
                                },
                                body: JSON.stringify({
                                  message: removeMessage,
                                }),
                              }
                            );

                            const data = await res.json();
                            if (res.ok) {
                              alert("✅ User removed successfully!");
                              setUsers(
                                users.filter((u) => u._id !== selectedUser._id)
                              );
                              setShowRemoveModal(false);
                              setRemoveMessage("");
                            } else {
                              alert(
                                `❌ Error: ${
                                  data.message || "Failed to remove user"
                                }`
                              );
                            }
                          } catch (err) {
                            console.error(err);
                            alert("❌ Something went wrong!");
                          } finally {
                            setRemoving(false);
                          }
                        }}
                        disabled={removing}
                        className="px-3 md:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm md:text-base"
                      >
                        {removing ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {users.length > 0 && (
                <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-center">
                  <div className="text-xs md:text-sm text-gray-500">
                    Showing {(page - 1) * perPage + 1} to{" "}
                    {Math.min(page * perPage, users.length)} of {users.length}{" "}
                    results
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                    >
                      <FaChevronLeft className="text-xs" /> Prev
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border text-xs md:text-sm ${
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
                      className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
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
            <div className="bg-white p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-0">
                  Jobs Management
                </h2>
                <div className="text-sm text-gray-500">
                  {jobs.length} jobs found
                </div>
              </div>

              {/* Filter & Sort */}
              <div className="mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs by title..."
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full md:w-auto px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8 md:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {jobs.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaBriefcase className="text-xl md:text-3xl text-gray-400" />
                      </div>
                      <h3 className="text-base md:text-lg font-medium text-gray-800 mb-1">
                        No jobs found
                      </h3>
                      <p className="text-gray-500 text-sm md:text-base">
                        Try adjusting your search or filter to find what you're
                        looking for.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                      {jobs.map((job) => (
                        <div
                          key={job._id}
                          className="border border-gray-200 rounded-lg md:rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="p-3 md:p-5">
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                              <h3 className="font-semibold text-base md:text-lg text-gray-800 line-clamp-1">
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
                            <p className="text-gray-600 mb-3 md:mb-4 line-clamp-2 text-sm md:text-base">
                              {job.description}
                            </p>
                            <div className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4">
                              <p className="truncate">{job.address}</p>
                              <div className="flex items-center gap-2 mt-1 md:mt-2">
                                <FaCalendarAlt className="text-gray-400 text-xs" />
                                <span>
                                  Created: {formatDate(job.createdAt)}
                                </span>
                              </div>
                            </div>

                            {job.createdBy && (
                              <div className="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-100">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                  {job.createdBy.profilePicture ? (
                                    <img
                                      src={job.createdBy.profilePicture}
                                      alt={job.createdBy.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FaUser className="text-gray-600 text-sm" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-800 truncate text-sm md:text-base">
                                    {job.createdBy.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    Posted by
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="px-3 md:px-5 py-2 md:py-3 bg-gray-50 flex justify-between">
                            <button className="text-xs md:text-sm text-indigo-600 font-medium hover:text-indigo-800">
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setShowRemoveJobModal(true);
                                setRemoveJobMessage("");
                              }}
                              className="text-xs md:text-sm text-red-600 font-medium hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Remove Job Modal */}
              {showRemoveJobModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                      Remove Job: {selectedJob.title}
                    </h2>
                    <p className="text-gray-600 mb-3 text-sm md:text-base">
                      Please provide a message for the job owner:
                    </p>
                    <textarea
                      rows={3}
                      value={removeJobMessage}
                      onChange={(e) => setRemoveJobMessage(e.target.value)}
                      placeholder="Enter reason..."
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:outline-none text-sm md:text-base"
                    />

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowRemoveJobModal(false);
                          setSelectedJob(null);
                          setRemoveJobMessage("");
                        }}
                        className="px-3 md:px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm md:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setRemovingJob(true);
                          try {
                            const res = await fetch(
                              `${backendUrl}admin/removeJob/${selectedJob._id}`,
                              {
                                method: "DELETE",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "accessToken"
                                  )}`,
                                },
                                body: JSON.stringify({
                                  message: removeJobMessage,
                                }),
                              }
                            );

                            const data = await res.json();
                            if (res.ok) {
                              alert("✅ Job removed successfully!");
                              setJobs(
                                jobs.filter((j) => j._id !== selectedJob._id)
                              );
                              setShowRemoveJobModal(false);
                              setRemoveJobMessage("");
                            } else {
                              alert(
                                `❌ Error: ${
                                  data.message || "Failed to remove job"
                                }`
                              );
                            }
                          } catch (err) {
                            console.error(err);
                            alert("❌ Something went wrong!");
                          } finally {
                            setRemovingJob(false);
                          }
                        }}
                        disabled={removingJob}
                        className="px-3 md:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm md:text-base"
                      >
                        {removingJob ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {jobs.length > 0 && (
                <div className="mt-4 md:mt-6 flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-center">
                  <div className="text-xs md:text-sm text-gray-500">
                    Showing {(page - 1) * perPage + 1} to{" "}
                    {Math.min(page * perPage, jobs.length)} of {jobs.length}{" "}
                    results
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={page === 1}
                      className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                    >
                      <FaChevronLeft className="text-xs" /> Prev
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border text-xs md:text-sm ${
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
                      className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                    >
                      Next <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] p-3 md:p-6 flex flex-col">
              {/* Header */}
              <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
                GigPoint Stats
              </h1>

              {/* Main content: Two columns */}
              <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden">
                {/* Left: Workers */}
                <div className="flex-1 bg-white p-3 md:p-4 rounded-lg md:rounded-xl shadow-md border border-gray-100 overflow-y-auto">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-3 md:mb-4">
                    👷 Top Workers
                  </h2>
                  <div className="space-y-2 md:space-y-3">
                    {topWorkers.length > 0 ? (
                      topWorkers.map((worker, index) => (
                        <div
                          key={worker._id}
                          className={`flex items-center gap-3 p-2 md:p-3 rounded-lg hover:shadow-md transition
                            ${
                              index === 0
                                ? "bg-indigo-50 border border-indigo-300"
                                : "border border-gray-100"
                            }`}
                        >
                          <span className="text-base md:text-lg font-bold w-5 md:w-6 text-gray-700">
                            {index + 1}
                          </span>
                          <UserCard user={worker} type="worker" />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm md:text-base">
                        No workers found.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Customers */}
                <div className="flex-1 bg-white p-3 md:p-4 rounded-lg md:rounded-xl shadow-md border border-gray-100 overflow-y-auto">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-3 md:mb-4">
                    🧑‍💼 Top Customers
                  </h2>
                  <div className="space-y-2 md:space-y-3">
                    {topCustomers.length > 0 ? (
                      topCustomers.map((customer, index) => (
                        <div
                          key={customer._id}
                          className={`flex items-center gap-3 p-2 md:p-3 rounded-lg hover:shadow-md transition
                            ${
                              index === 0
                                ? "bg-indigo-50 border border-indigo-300"
                                : "border border-gray-100"
                            }`}
                        >
                          <span className="text-base md:text-lg font-bold w-5 md:w-6 text-gray-700">
                            {index + 1}
                          </span>
                          <UserCard user={customer} type="customer" />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm md:text-base">
                        No customers found.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto-refresh toggle */}
              <div className="mt-4 bg-white p-3 md:p-4 rounded-lg md:rounded-xl shadow-md border border-gray-100 flex items-center justify-between w-full md:w-1/3">
                <span className="text-gray-700 font-medium text-sm md:text-base">
                  Auto Refresh Stats
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autoRefresh}
                    onChange={() => setAutoRefresh(!autoRefresh)}
                  />
                  <div className="w-9 h-5 md:w-11 md:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
