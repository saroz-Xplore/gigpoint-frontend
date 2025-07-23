import React, { useEffect, useState } from "react";

const WorkerProfileUpdate = () => {
  const [formData, setFormData] = useState({
    address: "",
    phoneNo: "",
    skills: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    const fetchedSkills = `["plumber", "cleaner"]`;
    let parsedSkills;
    try {
      parsedSkills = JSON.parse(fetchedSkills);
    } catch (e) {
      parsedSkills = [];
    }

    setFormData({
      address: "balaju",
      phoneNo: "9821232346",
      skills: parsedSkills.join(", "),
      currentPassword: "",
      newPassword: "",
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Update Profile</h2>
      <form className="space-y-4">
        <div className="flex items-center">
          <label className="w-40 font-medium">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="flex-1 p-2 border rounded"
          />
        </div>

        <div className="flex items-center">
          <label className="w-40 font-medium">Phone Number</label>
          <input
            type="text"
            name="phoneNo"
            value={formData.phoneNo}
            onChange={handleChange}
            className="flex-1 p-2 border rounded"
          />
        </div>

        <div className="flex items-center">
          <label className="w-40 font-medium">Skills (comma separated)</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="flex-1 p-2 border rounded"
          />
        </div>

        <div className="flex items-center">
          <label className="w-40 font-medium">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="flex-1 p-2 border rounded"
          />
        </div>

        <div className="flex items-center">
          <label className="w-40 font-medium">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="flex-1 p-2 border rounded"
          />
        </div>

        <div className="flex items-center">
          <label className="w-40 font-medium">Profile Picture</label>
          <input type="file" />
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default WorkerProfileUpdate;
