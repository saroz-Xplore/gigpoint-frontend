import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BASE_URL;

const WorkerProfileUpdate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: "",
    phoneNo: "",
    skills: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [message, setMessage] = useState("");
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${backendUrl}auth/my`, {
          credentials: "include",
        });
        const data = await res.json();

        setFormData({
          address: data.data.Worker.address || "",
          phoneNo: data.data.Worker.phoneNo || "",
          skills: Array.isArray(data.data.Worker.skills)
            ? data.data.Worker.skills.join(", ")
            : "",
        });

        setOriginalData({
          address: data.data.Worker.address || "",
          phoneNo: data.data.Worker.phoneNo || "",
          skills: Array.isArray(data.data.Worker.skills)
            ? data.data.Worker.skills.join(", ")
            : "",
        });

        if (data.data.Worker.profilePicture) {
          setImagePreview(data.data.Worker.profilePicture);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFields = {};
    for (const key in formData) {
      if (formData[key] !== originalData[key]) {
        updatedFields[key] = formData[key];
      }
    }

    
    if (
      Object.keys(updatedFields).length === 0 &&
      profilePicture === null
    ) {
      alert("No any changes made!");
      return;
    }

    if (updatedFields.skills) {
      updatedFields.skills = updatedFields.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const formToSend = new FormData();
    Object.entries(updatedFields).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formToSend.append(`${key}[]`, v));
      } else {
        formToSend.append(key, value);
      }
    });

    if (profilePicture) {
      formToSend.append("profilePicture", profilePicture);
    }

    try {
      const res = await fetch(`${backendUrl}auth/update`, {
        method: "PUT",
        credentials: "include",
        body: formToSend,
      });

      const result = await res.json();

      setMessage("Profile updated successfully!");
      setIsUpdated(true);
    } catch (err) {
      console.error("Update failed:", err);
      setMessage("❌ Failed to update profile.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-8 p-8 bg-white rounded-xl shadow-xl border border-blue-700 text-center">
      
      {!isUpdated && (
        <h2 className="text-2xl font-bold mb-6 text-blue-600">
          Update Your Profile
        </h2>
      )}

      {isUpdated ? (
        <div className="flex flex-col items-center space-y-6 py-12 bg-green-50 rounded-xl shadow-md border border-green-300">
          <div className="bg-green-100 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <p className="text-blue-700 font-bold text-xl">{message}</p>

          <button
            onClick={() => navigate("/worker-dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md shadow-md transition"
          >
            Go to Profile
          </button>
        </div>
      ) : (
        <form className="space-y-6 text-left" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 text-2xl shadow-sm">
                  ?
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white px-2 py-0.5 text-xs rounded-full cursor-pointer shadow-md">
                Edit
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-blue-400 text-xs mt-2">Profile Picture Upload</p>
          </div>

          {[{ label: "Address", name: "address" },
  { label: "Phone No", name: "phoneNo" }].map(({ label, name }) => (
  <div key={name} className="flex flex-col gap-1">
    <label className="font-medium text-blue-700 text-sm">{label}</label>
    <input
      type="text"
      name={name}
      value={formData[name]}
      onChange={handleChange}
      className="p-2 border border-blue-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:outline-none text-sm"
    />
  </div>
))}
         <div className="flex flex-col gap-1">
  <label className="font-medium text-blue-700 text-sm">Skills</label>

  <select
    onChange={(e) => {
      const value = e.target.value;
      if (value && !formData.skills.split(",").includes(value)) {
        setFormData((prev) => ({
          ...prev,
          skills: prev.skills
            ? `${prev.skills},${value}`
            : value,
        }));
      }
      e.target.value = ""; 
    }}
    className="p-2 border border-blue-300 rounded-md focus:ring-1 focus:ring-blue-400 focus:outline-none text-sm"
  >
    <option value="">Select Skill</option>
    <option value="plumber">Plumber</option>
    <option value="electrician">Electrician</option>
    <option value="cleaner">Cleaner</option>
    <option value="saloon">Saloon</option>
    <option value="carpentry">Carpentry</option>
    <option value="driver">Driver</option>
    <option value="homeRenovation">Home Renovation</option>
  </select>

  
  <div className="flex flex-wrap gap-2 mt-2">
    {formData.skills &&
      formData.skills.split(",").map((skill, idx) => (
        <span
          key={idx}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm shadow-sm"
        >
          {skill}
          <button
            type="button"
            onClick={() => {
              const updated = formData.skills
                .split(",")
                .filter((s) => s !== skill)
                .join(",");
              setFormData((prev) => ({ ...prev, skills: updated }));
            }}
            className="text-blue-500 hover:text-red-500"
          >
            ×
          </button>
        </span>
      ))}
  </div>
</div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition shadow-md cursor-pointer"
            >
              Update Profile
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile/change-password")}
              className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded-md text-sm transition shadow-md cursor-pointer"
            >
              Change Password
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WorkerProfileUpdate;
