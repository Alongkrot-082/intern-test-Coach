import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/mockApi.js';

export default function AdminPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.getTasks(token), api.getUsers(token)])
      .then(([taskData, userData]) => {
        if (!active) return;
        setTasks(taskData.tasks);
        setEmployees(userData.users);
        setAssignee(String(userData.users[0]?.id ?? ''));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'โหลดข้อมูลไม่สำเร็จ');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const task = await api.createTask(token, { title, assigned_to: assignee });
      setTasks((current) => [task, ...current]);
      setTitle('');
    } catch (requestError) {
      setError(requestError.message || 'สร้าง Task ไม่สำเร็จ');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageShell title="งานทั้งหมด">
      <section className="panel">
        <div className="section-heading">
          <div><h2>สร้าง Task</h2><p className="muted">มอบหมายงานให้ Employee</p></div>
        </div>
        <form className="create-form" onSubmit={handleCreate}>
          <label className="field">
            <span>ชื่อ Task</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={240} />
          </label>
          <label className="field">
            <span>ผู้รับผิดชอบ</span>
            <select value={assignee} onChange={(event) => setAssignee(event.target.value)} required>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
          </label>
          <button className="button button-primary" type="submit" disabled={creating || loading || !employees.length}>
            {creating ? 'กำลังบันทึก…' : 'สร้าง Task'}
          </button>
        </form>
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div><h2>รายการ Task</h2><p className="muted">ทั้งหมด {tasks.length} รายการ</p></div>
        </div>
        {loading ? <p className="muted">กำลังโหลดรายการ…</p> : (
          <TaskList tasks={tasks} employees={employees} />
        )}
      </section>
    </PageShell>
  );
}

function TaskList({ tasks, employees }) {
  const employeeNames = new Map(employees.map((employee) => [employee.id, employee.name]));
  if (!tasks.length) return <p className="empty-state">ยังไม่มี Task</p>;
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="task-row" key={task.id}>
          <div><strong>{task.title}</strong><span className="task-meta">ผู้รับผิดชอบ: {employeeNames.get(task.assigned_to)}</span></div>
          <span className={`status status-${task.status === 'Done' ? 'done' : 'todo'}`}>{task.status}</span>
        </article>
      ))}
    </div>
  );
}
