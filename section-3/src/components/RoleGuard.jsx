import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleGuard({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== role) {
    return (
      <Navigate
        to={`/${user.role}`}
        replace
        state={{ notice: `หน้านี้สำหรับ ${role === 'admin' ? 'Admin' : 'Employee'} เท่านั้น` }}
      />
    );
  }
  return children;
}
