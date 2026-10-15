import { useEffect, useMemo, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/mockApi.js';

export default function EmployeePage() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadTasks = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const data = await api.getTasks(token);
        if (active) {
          setTasks(data.tasks);
          setError('');
        }
      } catch (requestError) {
        if (active) setError(requestError.message || 'โหลดรายการไม่สำเร็จ');
      } finally {
        if (active && showLoading) setLoading(false);
      }
    };

    loadTasks(true);
    const intervalId = window.setInterval(() => loadTasks(), 10000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.assigned_to === user.id &&
      (filter === 'All' || task.status === filter)),
    [tasks, user.id, filter],
  );

  const markDone = async (task) => {
    if (task.status !== 'To Do' || pendingIds.has(task.id)) return;
    const previousStatus = task.status;
    setError('');
    setPendingIds((current) => new Set(current).add(task.id));
    setTasks((current) => current.map((item) =>
      item.id === task.id ? { ...item, status: 'Done' } : item));
    try {
      const savedTask = await api.updateStatus(token, task.id, 'Done');
      setTasks((current) => current.map((item) =>
        item.id === savedTask.id ? savedTask : item));
    } catch (requestError) {
      setTasks((current) => current.map((item) =>
        item.id === task.id ? { ...item, status: previousStatus } : item));
      setError(requestError.message || 'อัปเดตไม่สำเร็จ');
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  };

  return (
    <PageShell title="งานของฉัน">
      <section className="panel">
        <div className="section-heading">
          <div><h2>รายการ Task</h2><p className="muted">แสดงเฉพาะงานที่มอบหมายให้คุณ</p></div>
          <label className="filter-control">
            <span>สถานะ</span>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option>All</option>
              <option>To Do</option>
              <option>Done</option>
            </select>
          </label>
        </div>
        {loading && <p className="muted">กำลังโหลดรายการ…</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {!loading && (
          visibleTasks.length ? (
            <div className="task-list">
              {visibleTasks.map((task) => (
                <article className="task-row" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <span className={`status status-${task.status === 'Done' ? 'done' : 'todo'}`}>{task.status}</span>
                  </div>
                  {task.status === 'To Do' && (
                    <button
                      className="button button-primary"
                      onClick={() => markDone(task)}
                      disabled={pendingIds.has(task.id)}
                    >
                      {pendingIds.has(task.id) ? 'กำลังบันทึก…' : 'เปลี่ยนเป็น Done'}
                    </button>
                  )}
                </article>
              ))}
            </div>
          ) : <p className="empty-state">ไม่มี Task ในสถานะนี้</p>
        )}
      </section>
    </PageShell>
  );
}
