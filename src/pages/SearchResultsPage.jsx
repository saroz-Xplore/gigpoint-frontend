import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BASE_URL;
const token = localStorage.getItem("accessToken");

const SearchResultsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const title = queryParams.get("title") || "";

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    if (!title.trim()) {
      setJobs([]);
      return;
    }

    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await fetch(
          `${backendUrl}job/searchJob?title=${encodeURIComponent(title)}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setJobs(data.data?.result || []);
      } catch (err) {
        console.error(err);
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [title]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">
        Search Results for "{title}"
      </h2>

      {loadingJobs && <p>Loading jobs...</p>}

      {!loadingJobs && jobs.length === 0 && <p>No jobs found.</p>}

      <ul>
        {jobs.map((job) => (
          <li key={job._id} className="border p-4 rounded mb-2">
            <h3 className="font-bold">{job.title}</h3>
            <p>Status: {job.status}</p>
            <p>Category: {job.category || "N/A"}</p>
            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResultsPage;
