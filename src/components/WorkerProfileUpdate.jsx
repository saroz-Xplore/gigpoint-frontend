import React, { useEffect, useState } from "react";

const backendUrl= import.meta.env.VITE_BASE_URL

const WorkerProfileUpdate = () => {
  const [formData, setFormData] = useState({
    address: "",
    phoneNo: "",
    skills: "",
    currentPassword: "",
    newPassword: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${backendUrl}auth/my`, {
        credentials: "include",
      });
      const data = await res.json();

      setFormData({
        address: data.address || "",
        phoneNo: data.phoneNo || "",
        skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
        currentPassword: "",
        newPassword: "",
      });

      setOriginalData({
        address: data.address || "",
        phoneNo: data.phoneNo || "",
        skills: Array.isArray(data.skills) ? data.skills.join(", ") : "",
      });

      setLoading(false); 
    } catch (err) {
      console.error("Error fetching profile:", err);
      setLoading(false); 
    }
  };

  fetchProfile();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const updatedFields = {};

  for (const key in formData) {
    if (
      formData[key] &&
      (formData[key] !== originalData[key] || key.includes("Password"))
    ) {
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
    console.log("Update successful:", result);
  } catch (err) {
    console.error("Update failed:", err);
  }
};

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border border-gray-300 w-full sm:px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Update Profile</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {[
          { label: "Address", name: "address", type: "text" },
          { label: "Phone Number", name: "phoneNo", type: "text" },
          { label: "Skills", name: "skills", type: "text" },
          { label: "Current Password", name: "currentPassword", type: "password" },
          { label: "New Password", name: "newPassword", type: "password" },
        ].map(({ label, name, type }) => (
          <div key={name} className="flex flex-col sm:flex-row sm:items-center">
            <label className="sm:w-40 font-medium mb-1 sm:mb-0">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className="flex-1 p-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="sm:w-40 font-medium mb-1 sm:mb-0">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition duration-200"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default WorkerProfileUpdate;
