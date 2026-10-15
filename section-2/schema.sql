-- PostgreSQL schema for a persistent Project Access Control system.

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    display_name VARCHAR(160) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(16) NOT NULL CHECK (role IN ('admin', 'employee')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name)
);

CREATE TABLE tasks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(240) NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT NOT NULL DEFAULT '',
    assigned_to BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(16) NOT NULL DEFAULT 'To Do'
        CHECK (status IN ('To Do', 'Done')),
    created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- Keep the historical task ID without a FK so deleting a task cannot erase its audit trail.
    task_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supports listing a project’s tasks newest-first (including pagination).
CREATE INDEX tasks_project_created_idx
    ON tasks (project_id, created_at DESC, id DESC);

-- Supports Employee task list/filter queries by assignee and status.
CREATE INDEX tasks_assignee_status_created_idx
    ON tasks (assigned_to, status, created_at DESC, id DESC);

-- Supports audit history lookup for a task in chronological order.
CREATE INDEX audit_log_task_created_idx
    ON audit_log (task_id, created_at DESC, id DESC);
