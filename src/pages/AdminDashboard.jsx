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
  FaUserTie,
  FaUserCog,
  FaUserFriends,
  FaMoneyBillWave,
  FaTrash,
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

  const doughnutData = {
    labels: ["Workers", "Customers", "Admins"],
    datasets: [
      {
        label: "User Roles",
        data: [
          userRoleData.workers,
          userRoleData.customers,
          userRoleData.admins,
        ],
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"],
        hoverOffset: 10,
      },
    ],
  };

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

  //for stats

  const [topWorkers, setTopWorkers] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
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
          console.log(data)
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-100 to-blue-50 text-blue-900 flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-6 text-2xl font-bold border-b border-blue-200">
          Admin Panel
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
              }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </li>
          ))}
        </ul>
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
            <div className="p-2 md:p-4 h-screen flex flex-col gap-3 bg-gray-50">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 flex-shrink-0">
                {[
                  {
                    icon: (
                      <FaUsers className="text-blue-500 text-2xl md:text-3xl" />
                    ),
                    label: "Total Users",
                    value: stats.totalUsers,
                  },
                  {
                    icon: (
                      <FaBriefcase className="text-green-500 text-2xl md:text-3xl" />
                    ),
                    label: "Total Jobs",
                    value: stats.totalJobs,
                  },
                  {
                    icon: (
                      <FaPlayCircle className="text-purple-500 text-2xl md:text-3xl" />
                    ),
                    label: "Active Jobs",
                    value: stats.activeJobs,
                  },
                  {
                    icon: (
                      <FaSyncAlt className="text-orange-500 text-2xl md:text-3xl" />
                    ),
                    label: "Ongoing Jobs",
                    value: stats.ongoingJobs,
                  },
                  {
                    icon: (
                      <FaMoneyBillWave className="text-indigo-500 text-2xl md:text-3xl" />
                    ),
                    label: "Transactions",
                    value: `₨ ${stats.totalTransaction}`,
                  },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-white shadow rounded-xl p-2 md:p-3 flex flex-col items-center justify-center hover:shadow-md transition duration-300"
                  >
                    {card.icon}
                    <h3 className="text-[10px] md:text-xs font-semibold text-gray-500 uppercase mb-1 text-center">
                      {card.label}
                    </h3>
                    <p className="text-sm md:text-lg font-bold text-gray-800">
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Bar Graph + Legend */}
              <div className="bg-white shadow rounded-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-center gap-3 flex-grow">
                {/* Bar Graph */}
                <div className="w-full md:w-4/5 h-64 md:h-72">
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
                          maxBarThickness: 50,
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
                          ticks: { font: { size: 11 } },
                        },
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1, font: { size: 11 } },
                          grid: { drawBorder: false },
                        },
                      },
                    }}
                  />
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-2 w-1/5 justify-center md:justify-start text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>{" "}
                    Admins
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-sm"></span>{" "}
                    Workers
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-sm"></span>{" "}
                    Customers
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
                              <td className="py-3 px-4 flex gap-3">
                                <button className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                                  <FaEye /> View
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowRemoveModal(true);
                                  }}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-800"
                                >
                                  <FaTrash /> Remove
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
              {showRemoveModal && selectedUser && (
                <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Remove {selectedUser.fullName}?
                    </h2>
                    <p className="text-gray-600 mb-3">
                      Please provide a message for the user:
                    </p>
                    <textarea
                      rows={4}
                      value={removeMessage}
                      onChange={(e) => setRemoveMessage(e.target.value)}
                      placeholder="Enter reason..."
                      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowRemoveModal(false);
                          setSelectedUser(null);
                          setRemoveMessage("");
                        }}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-50"
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
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {removing ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
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

                          <div className="px-5 py-3 bg-gray-50 flex justify-between">
                            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setShowRemoveJobModal(true);
                                setRemoveJobMessage("");
                              }}
                              className="text-sm text-red-600 font-medium hover:text-red-800"
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
          {showRemoveJobModal && selectedJob && (
            <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Remove Job: {selectedJob.title}
                </h2>
                <p className="text-gray-600 mb-3">
                  Please provide a message for the job owner:
                </p>
                <textarea
                  rows={4}
                  value={removeJobMessage}
                  onChange={(e) => setRemoveJobMessage(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:outline-none"
                />

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRemoveJobModal(false);
                      setSelectedJob(null);
                      setRemoveJobMessage("");
                    }}
                    className="px-4 py-2 rounded-lg border hover:bg-gray-50"
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
                            body: JSON.stringify({ message: removeJobMessage }),
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
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {removingJob ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {activeTab === "stats" && (
            <div className="h-[calc(100vh-64px)] p-6 flex flex-col">
              {/* Header */}
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                GigPoint Stats
              </h1>

              {/* Main content: Two columns */}
              <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left: Workers */}
                <div className="flex-1 bg-white p-4 rounded-xl shadow-md border border-gray-100 overflow-y-auto">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    👷 Top Workers
                  </h2>
                  <div className="space-y-3">
                    {topWorkers.length > 0 ? (
                      topWorkers.map((worker, index) => (
                        <div
                          key={worker._id}
                          className={`flex items-center gap-4 p-3 rounded-lg hover:shadow-md transition
                  ${
                    index === 0
                      ? "bg-indigo-50 border border-indigo-300"
                      : "border border-gray-100"
                  }`}
                        >
                          <span className="text-lg font-bold w-6 text-gray-700">
                            {index + 1}
                          </span>
                          <UserCard user={worker} type="worker" />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No workers found.</p>
                    )}
                  </div>
                </div>

                {/* Right: Customers */}
                <div className="flex-1 bg-white p-4 rounded-xl shadow-md border border-gray-100 overflow-y-auto">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    🧑‍💼 Top Customers
                  </h2>
                  <div className="space-y-3">
                    {topCustomers.length > 0 ? (
                      topCustomers.map((customer, index) => (
                        <div
                          key={customer._id}
                          className={`flex items-center gap-4 p-3 rounded-lg hover:shadow-md transition
                  ${
                    index === 0
                      ? "bg-indigo-50 border border-indigo-300"
                      : "border border-gray-100"
                  }`}
                        >
                          <span className="text-lg font-bold w-6 text-gray-700">
                            {index + 1}
                          </span>
                          <UserCard user={customer} type="customer" />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No customers found.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto-refresh toggle */}
              <div className="mt-4 bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between w-1/3">
                <span className="text-gray-700 font-medium">
                  Auto Refresh Stats
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={autoRefresh}
                    onChange={() => setAutoRefresh(!autoRefresh)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
