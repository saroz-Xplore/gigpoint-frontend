import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaBriefcase,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaCloudUploadAlt,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

const backendUrl = import.meta.env.VITE_BASE_URL;

const WorkerSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phoneNo: "",
    experienceYear: "",
    skills: [],
    gender: "",
    role: "worker",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const API_URL = `${backendUrl}auth/create`;

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Image must be less than 2MB",
      }));
      return;
    }
    setProfilePicture(file);
    setErrors((prev) => ({ ...prev, profilePicture: null }));
  };

  const handleSkillChange = (e) => {
    const skill = e.target.value;
    if (skill && !formData.skills.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setErrors((prev) => ({ ...prev, skills: null }));
      e.target.value = "";
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    let errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Required";
    if (!formData.email) errors.email = "Required";
    else if (!validateEmail(formData.email)) errors.email = "Invalid email";
    if (!formData.password || formData.password.length < 6)
      errors.password = "Min 6 characters";
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "Passwords don't match";
    if (!formData.address.trim()) errors.address = "Required";
    if (!formData.phoneNo) errors.phoneNo = "Required";
    else if (!validatePhone(formData.phoneNo))
      errors.phoneNo = "Invalid number";
    if (formData.skills.length === 0) errors.skills = "Add at least one skill";
    if (!formData.gender) errors.gender = "Select gender";
    if (!formData.experienceYear || Number(formData.experienceYear) < 1)
      errors.experienceYear = "Minimum 1 year required";
    if (!profilePicture) errors.profilePicture = "Profile picture required";

    setErrors(errors);
    if (Object.keys(errors).length !== 0) return;

    try {
      setLoading(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "skills") {
          value.forEach((skill) => payload.append("skills[]", skill));
        } else {
          payload.append(key, value);
        }
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

      setSuccessMessage("Worker Successfully Registered.");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        phoneNo: "",
        experienceYear: "",
        skills: [],
        gender: "",
        role: "worker",
      });
      setProfilePicture(null);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Join Gigpoint as a Worker
          </h1>
          <p className="text-gray-600 text-lg">
            Create your account and start finding suitable jobs today!
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Left Side (Illustration) */}
            <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-white flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/30 to-indigo-600/30 z-0"></div>
              <div className="relative z-10">
                <div className="flex justify-center items-center h-64 mb-6">
                  <img
                    src="/gigpointworker.png"
                    alt="Worker Illustration"
                    className="max-h-full w-auto object-contain drop-shadow-lg"
                  />
                </div>
                <h2 className="text-xl font-bold mb-4 text-center">
                  Why Join Gigpoint?
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                    <span>Find local jobs easily</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                    <span>Set your own schedule and price</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                    <span>Get paid for your skills</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="mt-1 mr-2 flex-shrink-0" />
                    <span>Build your experience & reputation</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 text-center text-blue-100 text-sm relative z-10">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login?role=worker")}
                  className="text-white font-medium hover:underline"
                >
                  Login here
                </button>
              </div>
            </div>

            {/* Right Side (Form) */}
            <div className="md:w-3/5 p-6 md:p-8">
              {successMessage ? (
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-green-600 mb-4">
                    You can now login to your account.
                  </p>
                  <button
                    onClick={() => navigate("/login?role=worker")}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <>
                  {apiError && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6 flex items-start">
                      <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                          <FaUserCircle />
                        </span>
                        Personal Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                          <label
                            htmlFor="fullName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Full Name*
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 border ${
                                errors.fullName
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                              placeholder="John Doe"
                              disabled={loading}
                            />
                            {errors.fullName && (
                              <div className="absolute right-3 top-3 text-red-500">
                                <FaExclamationCircle />
                              </div>
                            )}
                          </div>
                          {errors.fullName && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Email*
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 border ${
                                errors.email
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                              placeholder="john@example.com"
                              disabled={loading}
                            />
                            {errors.email && (
                              <div className="absolute right-3 top-3 text-red-500">
                                <FaExclamationCircle />
                              </div>
                            )}
                          </div>
                          {errors.email && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>

                        {/* Password */}
                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Password*
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 border ${
                                errors.password
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                              placeholder="••••••••"
                              disabled={loading}
                            />
                            {errors.password && (
                              <div className="absolute right-3 top-3 text-red-500">
                                <FaExclamationCircle />
                              </div>
                            )}
                          </div>
                          {errors.password && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.password}
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Confirm Password*
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 border ${
                                errors.confirmPassword
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                              placeholder="••••••••"
                              disabled={loading}
                            />
                            {errors.confirmPassword && (
                              <div className="absolute right-3 top-3 text-red-500">
                                <FaExclamationCircle />
                              </div>
                            )}
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label
                            htmlFor="phoneNo"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Phone Number*
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              id="phoneNo"
                              name="phoneNo"
                              value={formData.phoneNo}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 border ${
                                errors.phoneNo
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                              placeholder="1234567890"
                              disabled={loading}
                            />
                            {errors.phoneNo && (
                              <div className="absolute right-3 top-3 text-red-500">
                                <FaExclamationCircle />
                              </div>
                            )}
                          </div>
                          {errors.phoneNo && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.phoneNo}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Work Details Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <span className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
                          <FaBriefcase />
                        </span>
                        Work Details
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Experience */}
                        <div>
                          <label
                            htmlFor="experienceYear"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Years of Experience*
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              id="experienceYear"
                              name="experienceYear"
                              min="1"
                              value={formData.experienceYear}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 border ${
                                errors.experienceYear
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                              placeholder="2"
                              disabled={loading}
                            />
                            {errors.experienceYear && (
                              <div className="absolute right-3 top-3 text-red-500">
                                <FaExclamationCircle />
                              </div>
                            )}
                          </div>
                          {errors.experienceYear && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.experienceYear}
                            </p>
                          )}
                        </div>

                        {/* Gender */}
                        <div>
                          <label
                            htmlFor="gender"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Gender*
                          </label>
                          <div className="relative">
                            <select
                              id="gender"
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className={`w-full px-4 py-2 border ${
                                errors.gender
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none`}
                              disabled={loading}
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                            <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                              <FaChevronDown />
                            </div>
                            {errors.gender && (
                              <div className="absolute right-8 top-3 text-red-500">
                                <FaExclamationCircle />
                              </div>
                            )}
                          </div>
                          {errors.gender && (
                            <p className="text-xs text-red-500 mt-1">
                              {errors.gender}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address*
                      </label>
                      <div className="relative">
                        <textarea
                          id="address"
                          name="address"
                          rows="3"
                          value={formData.address}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border ${
                            errors.address
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                          placeholder="Your full address"
                          disabled={loading}
                        ></textarea>
                        {errors.address && (
                          <div className="absolute right-3 top-3 text-red-500">
                            <FaExclamationCircle />
                          </div>
                        )}
                      </div>
                      {errors.address && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Skills*
                      </label>
                      <div className="mb-2">
                        <select
                          id="skill-input"
                          onChange={handleSkillChange}
                          className={`w-full px-4 py-2 border ${
                            errors.skills ? "border-red-500" : "border-gray-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                          disabled={loading}
                        >
                          <option value="">Select a skill</option>
                          <option value="plumber">Plumber</option>
                          <option value="electrician">Electrician</option>
                          <option value="cleaner">Cleaner</option>
                          <option value="saloon">Saloon</option>
                          <option value="carpentry">Carpentry</option>
                          <option value="driver">Driver</option>
                          <option value="homeRenovation">
                            Home Renovation
                          </option>
                        </select>
                      </div>
                      <div
                        id="skills-container"
                        className="flex flex-wrap gap-2 min-h-10"
                      >
                        {formData.skills.map((skill) => (
                          <div
                            key={skill}
                            className="relative bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition"
                              data-skill={skill}
                              disabled={loading}
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors.skills && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.skills}
                        </p>
                      )}
                    </div>

                    {/* Profile Picture */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Picture*
                      </label>
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor="profilePicture"
                          className="file-input-label flex-1 cursor-pointer"
                        >
                          <div
                            className={`border-2 border-dashed ${
                              errors.profilePicture
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg p-4 text-center hover:border-blue-500 transition`}
                          >
                            {profilePicture ? (
                              <div className="text-gray-500">
                                <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-2" />
                                <p className="text-sm truncate">
                                  {profilePicture.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {(profilePicture.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                <FaCloudUploadAlt className="text-2xl mx-auto mb-2" />
                                <p className="text-sm">
                                  Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-400">
                                  PNG, JPG (max. 2MB)
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              id="profilePicture"
                              name="profilePicture"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              disabled={loading}
                            />
                          </div>
                        </label>
                        {profilePicture && (
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                            <img
                              src={URL.createObjectURL(profilePicture)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      {errors.profilePicture && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.profilePicture}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Creating Account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerSignup;
