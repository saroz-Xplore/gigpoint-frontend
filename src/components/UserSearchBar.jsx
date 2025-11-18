import { useEffect, useState, useRef } from "react";

const backendUrl = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("accessToken");

const UserSearchBar = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
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

  return (
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
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
              >
                <h4 className="font-medium">{worker.name}</h4>
                <p className="text-sm text-gray-500">{worker.address}</p>
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
  );
};

export default UserSearchBar;
