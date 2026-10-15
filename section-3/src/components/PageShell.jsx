import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PageShell({ title, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const notice = location.state?.notice;
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setError('');
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true, state: { notice: 'ออกจากระบบแล้ว' } });
    } catch (requestError) {
      setError(requestError.message || 'ออกจากระบบไม่สำเร็จ');
      setLoggingOut(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">PROJECT ACCESS CONTROL</p>
          <h1>{title}</h1>
        </div>
        <div className="profile">
          <span>{user?.name} · {user?.role}</span>
          <button className="button button-quiet" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'กำลังออกจากระบบ…' : 'ออกจากระบบ'}
          </button>
        </div>
      </header>
      {notice && <p className="notice" role="status">{notice}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {children}
    </main>
  );
}
