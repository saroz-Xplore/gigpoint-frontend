import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContextProvider.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
console.log("loading:", loading, "user:", user);

  return children;
};

export default ProtectedRoute;
