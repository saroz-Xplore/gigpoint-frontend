import { useEffect, useState, useRef } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";

const backendUrl = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("accessToken");

const UserSearchBar = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNearbyWorkers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}job/recomendWorker`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setWorkers(data.data || []);
        setShowResults(true);
      } catch (err) {
        console.error(err);
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyWorkers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWorkerClick = (worker) => {
    setSelectedWorker(worker);
    setShowProfileModal(true);
    setShowResults(false);
    setShowContact(false);
  };

  const handleContactClick = () => {
    setShowContact(true);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setSelectedWorker(null);
    setShowContact(false);
  };

  const getStatusInfo = (worker) => {
    const isActive = worker.isAvailable !== false; // Default to active if not specified
    const lastActive = worker.updatedAt || worker.createdAt;

    return {
      isActive,
      statusText: isActive ? "Active Now" : "Offline",
      statusColor: isActive ? "text-green-600" : "text-gray-500",
      statusBg: isActive ? "bg-green-100" : "bg-gray-100",
      statusIcon: isActive ? FaCheckCircle : FaTimesCircle,
      lastActive: lastActive
        ? new Date(lastActive).toLocaleDateString()
        : "Recently",
    };
  };

  return (
    <>
      <div className="relative w-full max-w-md" ref={dropdownRef}>
        <input
          type="text"
          placeholder="Search nearby workers..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onFocus={() => setShowResults(true)}
        />

        {showResults && (
          <div className="absolute z-40 mt-1 w-full bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto border border-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : workers.length > 0 ? (
              workers.map((worker) => (
                <div
                  key={worker._id}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors duration-200"
                  onClick={() => handleWorkerClick(worker)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {worker.name || worker.fullName || "Unknown User"}
                        </h4>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FaMapMarkerAlt className="mr-1" size={12} />
                          {worker.address || "Address not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusInfo(worker).isActive ? (
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
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No nearby workers found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Worker Profile
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimesCircle size={20} />
                </button>
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                {/* Profile Image and Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 text-2xl" />
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

                {/* Skills/Profession */}
                {selectedWorker.profession && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Profession
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedWorker.profession}
                    </span>
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
                  onClick={handleCloseModal}
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
    </>
  );
};

export default UserSearchBar;
