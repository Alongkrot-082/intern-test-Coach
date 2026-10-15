import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingIds, setPendingIds] = useState(() => new Set());
  const pendingIdsRef = useRef(new Set());
  const writeVersionRef = useRef(0);

  useEffect(() => {
    let active = true;

    const loadTasks = async (showLoading = false) => {
      const requestVersion = writeVersionRef.current;
      if (showLoading) setLoading(true);
      try {
        const data = await api.getTasks(token);
        if (active && requestVersion === writeVersionRef.current) {
          setTasks((current) => data.tasks.map((task) => {
            const pendingTask = pendingIdsRef.current.has(task.id)
              ? current.find((item) => item.id === task.id)
              : null;
            return pendingTask ? { ...task, status: pendingTask.status } : task;
          }));
          setError('');
        }
      } catch {
        if (active) setError('โหลดรายการไม่สำเร็จ');
      } finally {
        if (active && showLoading) setLoading(false);
      }
    };

    loadTasks(true);
    const timer = window.setInterval(() => loadTasks(), 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [token]);

  const visible = tasks.filter(
    (task) => String(task.assigned_to) === String(user.id) &&
      (filter === 'All' || task.status === filter)
  );

  const markDone = async (task) => {
    if (task.status !== 'To Do' || pendingIdsRef.current.has(task.id)) return;
    const previousStatus = task.status;
    setError('');
    writeVersionRef.current += 1;
    pendingIdsRef.current.add(task.id);
    setPendingIds((current) => new Set(current).add(task.id));
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status: 'Done' } : item))
    );

    try {
      const savedTask = await api.updateStatus(token, task.id, 'Done');
      setTasks((current) =>
        current.map((item) => (item.id === savedTask.id ? savedTask : item))
      );
    } catch {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? { ...item, status: previousStatus } : item))
      );
      setError('อัปเดตไม่สำเร็จ');
    } finally {
      writeVersionRef.current += 1;
      pendingIdsRef.current.delete(task.id);
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
    }
  };

  return (
    <div className="page">
      <select value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option>All</option>
        <option>To Do</option>
        <option>Done</option>
      </select>

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="error" role="alert">{error}</p>}

      <ul>
        {visible.map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
            {task.status === 'To Do' && (
              <button onClick={() => markDone(task)} disabled={pendingIds.has(task.id)}>
                {pendingIds.has(task.id) ? 'กำลังบันทึก…' : 'เปลี่ยนเป็น Done'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
