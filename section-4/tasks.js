const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const ALLOWED_STATUSES = ['To Do', 'Done'];
const PAGE_SIZE = 20;
const isPositiveIntegerString = (value) => {
  if (!/^\d+$/.test(String(value))) return false;
  const number = BigInt(value);
  return number > 0n && number <= 9223372036854775807n;
};

router.get('/api/tasks', authenticate, async (req, res) => {
  const rawPage = req.query.page ?? '1';
  const page = Number(rawPage);

  if (!Number.isSafeInteger(page) || page < 1) {
    return res.status(400).json({ message: 'Invalid page' });
  }

  const offset = (page - 1) * PAGE_SIZE;
  if (!Number.isSafeInteger(offset)) {
    return res.status(400).json({ message: 'Invalid page' });
  }

  const { projectId } = req.query;
  if (projectId !== undefined && !isPositiveIntegerString(projectId)) {
    return res.status(400).json({ message: 'Invalid projectId' });
  }

  try {
    const conditions = [];
    const params = [];

    if (projectId !== undefined) {
      params.push(String(projectId));
      conditions.push(`project_id = $${params.length}`);
    }

    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      conditions.push(`assigned_to = $${params.length}`);
    }

    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    params.push(PAGE_SIZE, offset);
    const limitParam = params.length - 1;
    const offsetParam = params.length;
    const sql = `SELECT * FROM tasks${where} ORDER BY created_at DESC LIMIT $${limitParam} OFFSET $${offsetParam}`;
    const result = await db.query(sql, params);
    return res.status(200).json({ tasks: result.rows, page });
  } catch (err) {
    console.error('GET /api/tasks failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const taskId = req.params.id;
  const status = req.body?.status;

  if (!isPositiveIntegerString(taskId)) {
    return res.status(400).json({ message: 'Invalid task id' });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = rows[0];
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isEmployee = req.user.role === 'employee';
    const isOwner = String(task.assigned_to) === String(req.user.id);

    if (!isAdmin && (!isEmployee || !isOwner)) {
      return res.status(403).json({ message: 'No permission to edit this task' });
    }

    if (isEmployee && (task.status !== 'To Do' || status !== 'Done')) {
      return res.status(409).json({ message: 'Employees can only change To Do to Done' });
    }

    const { rows: updatedRows } = await db.query(
      `WITH updated AS (
         UPDATE tasks
         SET status = $1, updated_at = NOW()
         WHERE id = $2
           AND (
             $3 = 'admin'
             OR ($3 = 'employee' AND assigned_to = $4 AND status = 'To Do' AND $1 = 'Done')
           )
         RETURNING *
       ),
       logged AS (
         INSERT INTO audit_log (task_id, user_id, action)
         SELECT id, $4, $5 FROM updated
         RETURNING task_id
       )
       SELECT updated.*
       FROM updated
       INNER JOIN logged ON logged.task_id = updated.id`,
      [status, taskId, req.user.role, req.user.id, `status:${status}`],
    );

    if (!updatedRows[0]) {
      return res.status(409).json({ message: 'Task changed; reload and try again' });
    }

    return res.status(200).json({ task: updatedRows[0] });
  } catch (err) {
    console.error('PATCH /api/tasks/:id/status failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/api/tasks/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  if (!isPositiveIntegerString(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task id' });
  }

  try {
    const result = await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/tasks/:id failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
