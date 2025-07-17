import { useState } from "react";
import { useNavigate } from "react-router-dom";

const WorkerSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    address: "",
    phoneNo: "",
    experienceYear: "",
    skills: [],
    gender: "",
    role: "worker",
  });

  const [skillInput, setSkillInput] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const API_URL = "http://127.0.0.1:3000/api/v1/auth/create";

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setSkillInput("");
      setErrors((prev) => ({ ...prev, skills: undefined }));
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    let errors = {};

    if (!formData.fullName.trim()) errors.fullName = "Required";
    if (!formData.email) errors.email = "Required";
    else if (!validateEmail(formData.email)) errors.email = "Invalid email";
    if (!formData.password || formData.password.length < 6)
      errors.password = "Min 6 characters";
    if (!formData.address.trim()) errors.address = "Required";
    if (!formData.phoneNo) errors.phoneNo = "Required";
    else if (!validatePhone(formData.phoneNo)) errors.phoneNo = "Invalid number";
    if (formData.skills.length === 0) errors.skills = "Add at least one skill";
    if (!formData.gender) errors.gender = "Select gender";
    if (!formData.experienceYear || Number(formData.experienceYear) < 1) {
      errors.experienceYear = "Minimum 1 year required";
    }
    if (!profilePicture) errors.profilePicture = "Profile picture required";

    setErrors(errors);

    if (Object.keys(errors).length !== 0) return;

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("address", formData.address);
      payload.append("phoneNo", formData.phoneNo);
      payload.append("experienceYear", formData.experienceYear);
      payload.append("gender", formData.gender);
      payload.append("role", formData.role);

      formData.skills.forEach((skill) => {
        payload.append("skills", skill);   // send skills as array elements
      });

      payload.append("profilePicture", profilePicture);

      const response = await fetch(API_URL, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      alert("Signup successful!");
      navigate("/worker-dashboard");
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-200 to-white flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-4 sm:p-6">
        <h2 className="text-lg font-bold text-center text-blue-700 mb-4">
          Worker Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {[
            { name: "fullName", label: "Full Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "password", label: "Password", type: "password" },
            { name: "address", label: "Address", type: "text" },
            { name: "phoneNo", label: "Phone No", type: "tel" },
            { name: "experienceYear", label: "Experience", type: "number", min: 1 },
          ].map((field) => (
            <div key={field.name} className="flex items-center w-full">
              <label className="w-28 text-sm font-semibold text-gray-600">
                {field.label}:
              </label>
              <div className="flex-1">
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  min={field.min}
                  className={`w-full px-3 py-1 rounded-lg border text-xs focus:outline-none focus:ring-2 ${
                    errors[field.name]
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-300 focus:ring-blue-300"
                  }`}
                  disabled={loading}
                />
                {errors[field.name] && (
                  <p className="text-red-500 text-[10px] mt-0.5">{errors[field.name]}</p>
                )}
              </div>
            </div>
          ))}

          {/* Profile Picture Upload */}
          <div className="flex items-center w-full">
            <label className="w-28 text-sm font-semibold text-gray-600" htmlFor="profilePicture">
              Profile Picture:
            </label>
            <div className="flex-1">
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className={`w-full text-xs focus:outline-none focus:ring-2 rounded-lg border px-3 py-1 ${
                  errors.profilePicture
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-300"
                }`}
                disabled={loading}
              />
              {errors.profilePicture && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.profilePicture}</p>
              )}
            </div>
          </div>

          {/* Skills input */}
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2 mb-1">
              <label className="w-28 text-sm font-semibold text-gray-600">
                Skills:
              </label>
              <input
                type="text"
                name="skillInput"
                placeholder="Type skill and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className={`flex-grow px-3 py-1 rounded-lg border text-xs focus:outline-none focus:ring-2 ${
                  errors.skills
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-300"
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                aria-label="Add skill"
                className="bg-blue-700 hover:bg-blue-800 text-white px-3 rounded-lg text-lg font-bold leading-none select-none"
                disabled={loading}
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pl-28">
              {formData.skills.map((skill) => (
                <div
                  key={skill}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs flex items-center space-x-2"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-600 hover:text-blue-900 font-bold"
                    aria-label={`Remove skill ${skill}`}
                    disabled={loading}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            {errors.skills && (
              <p className="text-red-500 text-[10px] mt-0.5 pl-28">{errors.skills}</p>
            )}
          </div>

          {/* Gender */}
          <div className="flex items-center w-full">
            <label className="w-28 text-sm font-semibold text-gray-600">
              Gender:
            </label>
            <div className="flex-1">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-1 rounded-lg border text-xs focus:outline-none focus:ring-2 ${
                  errors.gender
                    ? "border-red-400 focus:ring-red-300"
                    : "border-gray-300 focus:ring-blue-300"
                }`}
                disabled={loading}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.gender}</p>
              )}
            </div>
          </div>

          {apiError && (
            <p className="text-red-600 text-xs text-center mt-1">{apiError}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 transition text-sm font-semibold mt-3"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <p className="text-center text-xs text-gray-500 mt-1">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default WorkerSignup;
