import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user || !user.roles.includes('admin')) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
