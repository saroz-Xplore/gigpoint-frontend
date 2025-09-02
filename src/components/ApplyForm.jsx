import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function JobApplicationForm() {
  const [message, setMessage] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); 
  const navigate = useNavigate();
  const messageBoxRef = useRef();

  const { id } = useParams();
  
const token = localStorage.getItem('accessToken')

  const backendUrl = import.meta.env.VITE_BASE_URL


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        messageBoxRef.current &&
        !messageBoxRef.current.contains(event.target)
      ) {
        setStatusMessage("");
      }
    };

    if (statusMessage) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusMessage]);

  const handleApply = async (e) => {
    e.preventDefault();

  
    setStatusMessage("");

    const newErrors = {};
    if (!message.trim()) newErrors.message = "Message is required";
    if (!estimatedPrice) newErrors.estimatedPrice = "Price is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);

   
    try {
  const response = await fetch(`${backendUrl}job/worker/apply/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ message, estimatedPrice }),
  });

  const data = await response.json();
  console.log('response', data);
  if (response.ok) {
    if (data.status === "already_requested") {
      setStatusMessage("already_requested");
    } else {
      setStatusMessage("submitted");
    }
  } else {
    setStatusMessage("error");
  }
} catch (error) {
  console.error("Application error:", error);
  setStatusMessage("error");
} finally {
  setIsSubmitting(false);
}
  };

  return (
    <div className="relative">
      {statusMessage && (
        <div className="absolute inset-0 bg-blue/20 backdrop-blur-sm z-10 flex items-center justify-center">
          <div
            ref={messageBoxRef}
          >
            {statusMessage === "submitted" ? (
              <>
              <div className="border-2 bg-blue-100 p-3 rounded-2xl">
                <h2 className="text-xl font-semibold text-green-700">
                  ✅ Application Submitted
                </h2>
                <p className="text-gray-600 mt-1">
                  Your application was submitted successfully.
                </p>
                </div>
              </>
            ) : (
              <div className="border-2 bg-blue-100 p-3 rounded-2xl">
                <h2 className="ml-8 text-xl font-semibold text-red-700">
                  ⚠️ ACCESS DENIED.
                </h2>
                <p className="text-gray-600 mt-1 p-2">
                  You have already applied for this job.
                </p>
              </div>
            )}
          </div>
    </div>
      )}

      
      <div
        className={`max-w-md mx-auto mt-8 mb-20 p-8 bg-gradient-to-tr from-white to-sky-50 rounded-xl
        shadow-md border border-gray-400 transition duration-300 ${
          statusMessage ? "blur-sm pointer-events-none" : ""
        }`}
      >
        
        <button
          onClick={() => navigate("/worker-dashboard")}
          className="flex items-center text-cyan-600 hover:text-cyan-800 mb-8 font-semibold select-none cursor-pointer transition-colors duration-200"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to Dashboard
        </button>

        <h2 className="text-2xl font-extrabold text-center text-cyan-800 mb-10 tracking-wide">
          <span className="border border-gray-400 bg-gray-200 px-4 py-1 rounded">
            Apply for Job
          </span>
        </h2>

        <form onSubmit={handleApply} className="space-y-6">
         
          <div>
            <label
              htmlFor="message"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Your message or proposal...
            </label>
            <textarea
              id="message"
              rows="4"
              className={`w-full rounded-lg border bg-white px-4 py-2 text-gray-900 text-base resize-none shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-colors duration-300 ${
                errors.message ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {errors.message && (
              <p className="text-red-600 mt-1 text-xs font-medium">
                {errors.message}
              </p>
            )}
          </div>

        
          <div>
            <label
              htmlFor="estimatedPrice"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Price
            </label>
            <input
              id="estimatedPrice"
              type="number"
              min="0"
              step="0.01"
              className={`w-full rounded-lg border bg-white px-4 py-2 text-gray-900 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-colors duration-300 ${
                errors.estimatedPrice ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter price"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
            />
            {errors.estimatedPrice && (
              <p className="text-red-600 mt-1 text-xs font-medium">
                {errors.estimatedPrice}
              </p>
            )}
          </div>

       
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-semibold text-white text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-blue-600 hover:to-cyan-600 active:scale-95 active:duration-75 transition-transform duration-200 shadow-md ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </div>
  );
}
