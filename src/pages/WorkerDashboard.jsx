import React, { useEffect, useState } from "react";
import { FaCog } from "react-icons/fa";
const backendUrl = import.meta.env.VITE_BASE_URL;

const WorkerDashboard = () => {
  const [worker, setWorker] = useState(null);
  const [suggestedWorks, setSuggestedWorks] = useState([]);
  const [loadingWorks, setLoadingWorks] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        const res = await fetch(`${backendUrl}auth/my`, {
          credentials: "include",
        });
        const userData = await res.json();
        setWorker(userData.data);
      } catch (err) {
        console.error("Error fetching worker profile:", err);
      }
    };

    const fetchSuggestedWorks = async () => {
      try {
        const res = await fetch(`${backendUrl}works/suggested`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestedWorks(data?.works || []);
        } else {
          setSuggestedWorks([]);
        }
      } catch (err) {
        console.error("Error fetching suggested works:", err);
        setSuggestedWorks([]);
      } finally {
        setLoadingWorks(false);
      }
    };

    fetchWorkerProfile();
    fetchSuggestedWorks();
  }, []);

  const handleWorkClick = (work) => {
    alert(`You clicked on: ${work.title}`);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
     
      <aside className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 w-full md:w-64 h-auto md:h-screen p-4 md:p-6 border-b md:border-b-0 md:border-r border-blue-200 flex flex-col">
       
        <div className="flex flex-col items-center text-center mb-6">
          <img
            className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-md mb-2"
            src={worker?.profilePicture || ""}
            alt="Profile"
          />
          <h2 className="text-lg md:text-xl font-semibold text-blue-900 truncate">
            {worker?.fullName || "Loading..."}
          </h2>
          <p className="text-xs md:text-sm text-blue-700 capitalize truncate">
            {worker?.profession || worker?.role}
          </p>
        </div>

        
       <div className="p-3 bg-white rounded-xl shadow text-left mb-4">
    <h1
      className="text-sm md:text-md font-semibold text-blue-900 mb-2 border-b-2 border-blue-500 pb-1"
      style={{ fontFamily: "'Courier New', Courier, monospace" }}
    >
      Personal Information
    </h1>
    <div className="text-xs md:text-sm text-blue-800 space-y-3">
      
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 mr-2 text-blue-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2v.511l-8 5-8-5V6h16zm-16 12V8.362l7.293 4.559a1 1 0 001.414 0L20 8.363V18H4z" />
        </svg>
        {worker?.email || "N/A"}
      </div>

   
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 mr-2 text-blue-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13 1.21.38 2.39.73 3.5a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.59-1.59a2 2 0 012.11-.45c1.11.35 2.29.6 3.5.73a2 2 0 011.72 2z" />
        </svg>
        {worker?.phoneNo || "N/A"}
      </div>

     
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 mr-2 text-blue-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
              </svg>
              {worker?.address || "N/A"}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-sm md:text-md w-full flex items-center gap-2 p-3 text-blue-900 font-semibold hover:bg-blue-50 transition
            }`}
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            <FaCog className="text-blue-700" />
            Settings
          </button>

          {showSettings && (
            <div
              className="border-t border-blue-200 p-3 text-blue-800 text-sm space-y-2"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <p><strong>Jobs Done:</strong> {worker?.jobDone || 0}</p>
              <p><strong>Jobs Applied:</strong> {worker?.jobApplied || 0}</p>
              <p><strong>Rating:</strong> {worker?.rating || "N/A"}</p>
            </div>
          )}
        </div>
      </aside>

      
      <main className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-6 text-blue-900">Suggested Work</h1>
        {loadingWorks ? (
          <p className="text-gray-500">Loading suggested works...</p>
        ) : suggestedWorks.length === 0 ? (
          <p className="text-gray-500">No suggested work available.</p>
        ) : (
          <ul className="space-y-4">
            {suggestedWorks.map((work) => (
              <li
                key={work.id}
                onClick={() => handleWorkClick(work)}
                className="cursor-pointer p-4 bg-white rounded shadow hover:bg-blue-50 transition"
              >
                <h2 className="text-lg font-semibold text-blue-800">{work.title}</h2>
                <p className="text-gray-600">{work.description}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default WorkerDashboard;
