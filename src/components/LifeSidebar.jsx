import React from "react";

const LeftSidebar = ({ worker, workinfo, isAvailable, toggleAvailability }) => {
  return (
    <aside className="bg-gradient-to-br from-blue-50 to-blue-100 md:w-72 w-full p-6 border-b md:border-b-0 md:border-r border-blue-200 flex flex-col space-y-6 overflow-auto min-h-screen">
      <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm border border-blue-100">
        <div className="relative mb-3">
          <img
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            src={worker?.profilePicture || "/default-avatar.png"}
            alt="Profile"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-avatar.png";
            }}
          />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div
              className={`p-1 rounded-full ${
                isAvailable ? "bg-green-400" : "bg-gray-300"
              } border-2 border-white`}
            >
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-blue-900 mb-1 px-2 py-1 rounded-md max-w-full truncate">
          {worker?.fullName || "Loading..."}
        </h2>
        <p
          className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 capitalize"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {worker?.profession || worker?.role || "Professional"}
        </p>

        <div className="w-full bg-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium text-blue-800"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              Availability
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={toggleAvailability}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border border-blue-100 overflow-auto">
        <div className="items-center mb-3 pb-2 border-b border-blue-400 inline-flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-blue-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2
            className="text-md font-semibold text-blue-900"
            style={{ fontFamily: "'Courier New', Courier, monospace" }}
          >
            Profile Details
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-blue-500 font-medium">Email</p>
              <p className="text-sm text-blue-800">
                {worker?.email || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-blue-500 font-medium">Phone</p>
              <p className="text-sm text-blue-800">
                {worker?.phoneNo || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-blue-500 font-medium">Address</p>
              <p className="text-sm text-blue-800">
                {worker?.address || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10m-12 5a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v7z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-blue-500 font-medium">Joined On</p>
              <p className="text-sm text-blue-800">
                {workinfo?.JoinedOn || "Jan 1 2001"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7 16h10M7 8h10M7 4h10"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-blue-500 font-medium">Skills</p>
              <p className="text-sm text-blue-800">
                {worker?.skills?.length
                  ? worker.skills.join(", ")
                  : "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3M12 3a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs text-blue-500 font-medium">Experience</p>
              <p className="text-sm text-blue-800">
                {worker?.experienceYear
                  ? `${worker?.experienceYear} years`
                  : "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;