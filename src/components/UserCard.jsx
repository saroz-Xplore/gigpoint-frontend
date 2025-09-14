export const UserCard = ({ user, type }) => (
  <div className="bg-white shadow-md rounded-xl p-4 flex items-center gap-4 hover:shadow-lg transition">
    <img
      src={user.profilePicture || "https://via.placeholder.com/80"}
      alt={user.fullName}
      className="w-16 h-16 rounded-full object-cover border"
    />
    <div className="flex-1">
      <h3 className="text-lg font-semibold">{user.fullName}</h3>
      <p className="text-sm text-gray-500">{user.email}</p>
      <p className="text-sm text-gray-400">{user.address || "No Address"}</p>
      <p className="mt-2 text-sm font-medium text-indigo-600">
        {type === "worker"
          ? `Jobs Done: ${user.jobsCount ?? 0}`
          : `Jobs Posted: ${user.postCount ?? 0}`}
      </p>
    </div>
  </div>
);
