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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${backendUrl}auth/my`, {
          credentials: "include",
        });
        const data = await res.json();
        console.log("fetched data:", data);

        setFormData({
          address: data.data.address || "",
          phoneNo: data.data.phoneNo || "",
          skills: Array.isArray(data.data.skills)
            ? data.data.skills.join(", ")
            : "",
        });

        setOriginalData({
          address: data.data.address || "",
          phoneNo: data.data.phoneNo || "",
          skills: Array.isArray(data.data.skills)
            ? data.data.skills.join(", ")
            : "",
        });

        if (data.data.profilePicture) {
          setImagePreview(data.data.profilePicture);
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
      if (formData[key] && formData[key] !== originalData[key]) {
        updatedFields[key] = formData[key];
      }
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
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-8 p-8 bg-white rounded-xl shadow-xl border border-blue-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Update Your Profile
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        
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

          {[
                { label: "Address", name: "address" },
                { label: "Phone No", name: "phoneNo" },
                { label: "Skills", name: "skills" },
              ].map(({ label, name }) => (
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

       
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm transition shadow-md"
          >
            Update Profile
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile/change-password")}
            className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded-md text-sm transition shadow-md"
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkerProfileUpdate;
