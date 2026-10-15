import { Navigate, Route, Routes } from 'react-router-dom';
import RoleGuard from './components/RoleGuard.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AdminPage from './pages/AdminPage.jsx';
import EmployeePage from './pages/EmployeePage.jsx';
import LoginPage from './pages/LoginPage.jsx';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <RoleGuard role="admin">
            <AdminPage />
          </RoleGuard>
        }
      />
      <Route
        path="/employee"
        element={
          <RoleGuard role="employee">
            <EmployeePage />
          </RoleGuard>
        }
      />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
