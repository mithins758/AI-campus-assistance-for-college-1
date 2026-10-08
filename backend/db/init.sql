-- Campus Management System — PostgreSQL initialization.
-- Safe to run on a fresh database. Rerunnable where practical.
-- Run: psql campus_management < db/init.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUM types (create only if missing so the file is rerunnable).
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'faculty', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE location_type AS ENUM ('classroom', 'lab', 'office', 'facility');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE faculty_status_type AS ENUM ('in-cabin', 'in-lecture', 'on-leave', 'in-meeting');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users table.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Locations table.
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  type location_type NOT NULL,
  floor INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Faculty status table.
CREATE TABLE IF NOT EXISTS faculty_status (
  faculty_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  status faculty_status_type NOT NULL,
  current_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedules table.
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  subject_name VARCHAR(150) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_time < end_time)
);

-- Indexes for common queries.
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_faculty_status_status ON faculty_status(status);
CREATE INDEX IF NOT EXISTS idx_schedules_user_day ON schedules(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedules_location_day ON schedules(location_id, day_of_week);

-- ---------------------------------------------------------------------------
-- Seed data (demo only).
-- All demo users share the password: Password123!
-- Hash below is bcrypt for "Password123!" (never store plaintext).
-- ---------------------------------------------------------------------------

-- Users: 1 admin, 2 faculty, 2 students (upsert by email so reruns are safe).
INSERT INTO users (id, name, email, password_hash, role, department) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin@campus.edu',
   '$2b$10$rRGhDqmrvjVBnRd6Fkep8OVSDXWoA0Uhd.YxW8KBXwHrmwBSOF96a', 'admin', 'Administration'),
  ('22222222-2222-2222-2222-222222222222', 'Professor Smith', 'smith@campus.edu',
   '$2b$10$rRGhDqmrvjVBnRd6Fkep8OVSDXWoA0Uhd.YxW8KBXwHrmwBSOF96a', 'faculty', 'Computer Applications'),
  ('33333333-3333-3333-3333-333333333333', 'Dr. Jane Rao', 'jane@campus.edu',
   '$2b$10$rRGhDqmrvjVBnRd6Fkep8OVSDXWoA0Uhd.YxW8KBXwHrmwBSOF96a', 'faculty', 'Computer Science'),
  ('44444444-4444-4444-4444-444444444444', 'Mithin S', 'mithin@example.com',
   '$2b$10$rRGhDqmrvjVBnRd6Fkep8OVSDXWoA0Uhd.YxW8KBXwHrmwBSOF96a', 'student', 'BCA'),
  ('55555555-5555-5555-5555-555555555555', 'Ananya K', 'ananya@example.com',
   '$2b$10$rRGhDqmrvjVBnRd6Fkep8OVSDXWoA0Uhd.YxW8KBXwHrmwBSOF96a', 'student', 'BCA')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- Locations.
INSERT INTO locations (id, code, name, type, floor) VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'LAB-201', 'Computer Lab 201', 'lab', 2),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'LAB-202', 'Computer Lab 202', 'lab', 2),
  ('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'CLS-101', 'Classroom 101', 'classroom', 1),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'CLS-102', 'Classroom 102', 'classroom', 1),
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'FAC-001', 'Faculty Cabin Block', 'facility', 1),
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'OFF-101', 'Faculty Office', 'office', 1),
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'LIB-001', 'Central Library', 'facility', 1)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  floor = EXCLUDED.floor;

-- Faculty status rows.
INSERT INTO faculty_status (faculty_id, status, current_location_id) VALUES
  ('22222222-2222-2222-2222-222222222222', 'in-cabin', 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1'),
  ('33333333-3333-3333-3333-333333333333', 'in-lecture', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1')
ON CONFLICT (faculty_id) DO UPDATE SET
  status = EXCLUDED.status,
  current_location_id = EXCLUDED.current_location_id,
  updated_at = NOW();

-- Schedules (day_of_week: 1=Monday .. 7=Sunday).
INSERT INTO schedules (user_id, location_id, subject_name, start_time, end_time, day_of_week) VALUES
  ('22222222-2222-2222-2222-222222222222', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Data Structures', '09:00', '10:00', 1),
  ('22222222-2222-2222-2222-222222222222', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Operating Systems', '10:15', '11:15', 2),
  ('33333333-3333-3333-3333-333333333333', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'Database Systems', '09:00', '10:00', 1),
  ('33333333-3333-3333-3333-333333333333', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'Web Programming', '11:30', '12:30', 3),
  ('44444444-4444-4444-4444-444444444444', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Data Structures Lab', '09:00', '11:00', 1),
  ('44444444-4444-4444-4444-444444444444', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Mathematics', '11:30', '12:30', 2),
  ('55555555-5555-5555-5555-555555555555', 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', 'Database Lab', '09:00', '11:00', 1),
  ('55555555-5555-5555-5555-555555555555', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'English', '10:00', '11:00', 4);
