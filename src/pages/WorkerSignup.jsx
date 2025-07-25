import { useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BASE_URL;

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
  const [successMessage, setSuccessMessage] = useState(null);

  const API_URL = `${backendUrl}auth/create`;

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
        payload.append("skills[]", skill);
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
    <div className="min-h-screen bg-gradient-to-tr from-blue-200 to-white flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold text-center text-blue-700 mb-4">
          WELCOME TO GIGPOINT !
        </h2>

        {!successMessage && (
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {[
              { name: "fullName", label: "Full Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "password", label: "Password", type: "password" },
              { name: "phoneNo", label: "Phone No", type: "tel" },
              {
                name: "experienceYear",
                label: "Experience",
                type: "number",
                min: 1,
              },
            ].map((field) => (
              <div key={field.name} className="flex items-center w-full">
                <label className="w-32 text-[15px] font-semibold text-gray-700">
                  {field.label}:
                </label>
                <div className="flex-1">
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    min={field.min}
                    className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors[field.name]
                        ? "border-red-400 focus:ring-red-300"
                        : "border-gray-400 focus:ring-blue-300"
                    }`}
                    disabled={loading}
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="flex items-start w-full">
              <label className="w-32 text-[15px] font-semibold text-gray-700 pt-2">
                Address:
              </label>
              <div className="flex-1">
                {formData.address.length > 40 ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.address
                        ? "border-red-400 focus:ring-red-300"
                        : "border-gray-400 focus:ring-blue-300"
                    }`}
                    disabled={loading}
                  ></textarea>
                ) : (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.address
                        ? "border-red-400 focus:ring-red-300"
                        : "border-gray-400 focus:ring-blue-300"
                    }`}
                    disabled={loading}
                  />
                )}
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Profile Picture */}
            <div className="flex items-center w-full">
              <label
                className="w-32 text-[15px] font-semibold text-gray-700"
                htmlFor="profilePicture"
              >
                Profile Picture:
              </label>
              <div className="flex-1 flex items-center gap-4">
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full text-sm focus:outline-none focus:ring-2 rounded-lg border px-4 py-2 ${
                    errors.profilePicture
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-400 focus:ring-blue-300"
                  }`}
                  disabled={loading}
                />
                {profilePicture && (
                  <img
                    src={URL.createObjectURL(profilePicture)}
                    alt="Profile Preview"
                    className="w-10 h-10 object-cover rounded-full border border-gray-400"
                  />
                )}
              </div>
            </div>
            {errors.profilePicture && (
              <p className="text-red-500 text-xs mt-1">
                {errors.profilePicture}
              </p>
            )}

            {/* Skills */}
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2 mb-1">
                <label className="w-32 text-[15px] font-semibold text-gray-700">
                  Skills:
                </label>
                <select
                  name="skillInput"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className={`flex-grow px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.skills
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-400 focus:ring-blue-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select a skill</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="cleaner">Cleaner</option>
                  <option value="saloon">Saloon</option>
                  <option value="carpentry">Carpentry</option>
                  <option value="driver">Driver</option>
                  <option value="homeRenovation">Home Renovation</option>
                </select>
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
              <div className="flex flex-wrap gap-2 pl-32">
                {formData.skills.map((skill) => (
                  <div
                    key={skill}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
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
                <p className="text-red-500 text-xs mt-1 pl-32">
                  {errors.skills}
                </p>
              )}
            </div>

            {/* Gender */}
            <div className="flex items-center w-full">
              <label className="w-32 text-[15px] font-semibold text-gray-700">
                Gender:
              </label>
              <div className="flex-1">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    errors.gender
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-400 focus:ring-blue-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                )}
              </div>
            </div>

            {apiError && (
              <p className="text-red-600 text-sm text-center mt-1">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition text-sm font-semibold mt-3"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>

            <p className="text-center text-sm text-gray-500 mt-2">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login?role=worker")}
                className="text-blue-600 font-semibold cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          </form>
        )}

        {successMessage && (
          <div className="text-center">
            <p className="text-green-600 text-sm font-medium mb-4">
              {successMessage}
            </p>
            <button
              onClick={() => navigate("/login?role=worker")}
              className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-6 rounded-lg text-sm font-semibold"
            >
              Go to Login
            </button>
          </div>
        )}

        {apiError && !successMessage && (
          <p className="text-red-600 text-sm text-center mt-1">{apiError}</p>
        )}
      </div>
    </div>
  );
};

export default WorkerSignup;
