const delay = (value, ms = 350) =>
  new Promise((resolve) => window.setTimeout(() => resolve(value), ms));

const users = [
  { id: 1, username: 'admin', name: 'Ariya Admin', role: 'admin' },
  { id: 2, username: 'employee', name: 'Niran Employee', role: 'employee' },
  { id: 3, username: 'employee2', name: 'Mali Employee', role: 'employee' },
];

let tasks = [
  { id: 1, title: 'วางแผนโครงสร้างระบบ', assigned_to: 2, status: 'To Do' },
  { id: 2, title: 'ออกแบบหน้า Dashboard', assigned_to: 3, status: 'To Do' },
  { id: 3, title: 'รวบรวมความต้องการ', assigned_to: 2, status: 'Done' },
  { id: 4, title: 'ตรวจสอบเอกสารโครงการ', assigned_to: 3, status: 'To Do' },
  { id: 5, title: 'เตรียมชุดทดสอบ', assigned_to: 2, status: 'To Do' },
  { id: 6, title: 'จัดทำสรุปความคืบหน้า', assigned_to: 3, status: 'Done' },
];

let nextTaskId = 7;
let nextTokenId = 1;
const sessions = new Map();

const requireUser = (token) => {
  const user = sessions.get(token);
  if (!user) throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
  return user;
};

export const api = {
  async login(username) {
    await delay(null);
    const user = users.find((candidate) => candidate.username === username.trim());
    if (!user) throw new Error('ไม่พบบัญชีผู้ใช้นี้');
    const token = `mock-token-${nextTokenId++}`;
    sessions.set(token, user);
    return { token, user };
  },

  async logout(token) {
    await delay(null, 100);
    sessions.delete(token);
  },

  async getUsers(token) {
    requireUser(token);
    await delay(null);
    return { users: users.filter((user) => user.role === 'employee') };
  },

  async getTasks(token) {
    const user = requireUser(token);
    await delay(null);
    const visibleTasks =
      user.role === 'admin'
        ? tasks
        : tasks.filter((task) => task.assigned_to === user.id);
    return { tasks: visibleTasks.map((task) => ({ ...task })) };
  },

  async createTask(token, { title, assigned_to }) {
    const user = requireUser(token);
    await delay(null);
    if (user.role !== 'admin') throw new Error('เฉพาะ Admin เท่านั้นที่สร้าง Task ได้');
    const normalizedTitle = title.trim();
    if (!normalizedTitle) throw new Error('กรุณาระบุชื่อ Task');
    if (!users.some((candidate) => candidate.id === Number(assigned_to) && candidate.role === 'employee')) {
      throw new Error('กรุณาเลือก Employee ที่มีอยู่ในระบบ');
    }
    const task = {
      id: nextTaskId++,
      title: normalizedTitle,
      assigned_to: Number(assigned_to),
      status: 'To Do',
    };
    tasks = [task, ...tasks];
    return { ...task };
  },

  async updateStatus(token, taskId, status) {
    const user = requireUser(token);
    await delay(null);
    const task = tasks.find((candidate) => candidate.id === Number(taskId));
    if (!task) throw new Error('ไม่พบ Task');
    if (user.role !== 'admin' && task.assigned_to !== user.id) {
      throw new Error('คุณไม่มีสิทธิ์แก้ไข Task นี้');
    }
    if (user.role === 'employee' && (task.status !== 'To Do' || status !== 'Done')) {
      throw new Error('Employee เปลี่ยนได้เฉพาะ To Do เป็น Done');
    }
    if (!['To Do', 'Done'].includes(status)) throw new Error('สถานะไม่ถูกต้อง');
    task.status = status;
    return { ...task };
  },
};
