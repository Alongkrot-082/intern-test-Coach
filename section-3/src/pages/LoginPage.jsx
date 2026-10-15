import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user: loggedInUser } = await login(username);
      navigate(location.state?.from?.pathname || `/${loggedInUser.role}`, {
        replace: true,
        state: location.state?.notice ? { notice: location.state.notice } : null,
      });
    } catch (requestError) {
      setError(requestError.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrap">
      <section className="login-card">
        <p className="eyebrow">PROJECT ACCESS CONTROL</p>
        <h1>เข้าสู่ระบบ</h1>
        <p className="muted">เลือกบัญชีเพื่อทดลองการจัดการ Task ตามสิทธิ์</p>
        {location.state?.notice && <p className="notice" role="status">{location.state.notice}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
          {error && <p className="error" role="alert">{error}</p>}
          <button className="button button-primary full-width" type="submit" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <div className="account-hint">
          <span>admin</span><span>employee</span><span>employee2</span>
        </div>
      </section>
    </main>
  );
}
