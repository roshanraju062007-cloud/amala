-- ============================================================
-- EduSphere LMS — PostgreSQL Schema
-- Amala Higher Secondary School
-- ============================================================

-- Drop existing tables (order matters for FK constraints)
DROP TABLE IF EXISTS library_issues CASCADE;
DROP TABLE IF EXISTS library_books CASCADE;
DROP TABLE IF EXISTS transport_assignments CASCADE;
DROP TABLE IF EXISTS transport_vehicles CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ── USERS (auth table for all roles) ─────────────────────────────────────
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  user_id     VARCHAR(30) UNIQUE NOT NULL,   -- e.g. admin, TCH001, STU001, PAR001
  password    VARCHAR(255) NOT NULL,          -- bcrypt hash
  role        VARCHAR(10) NOT NULL CHECK (role IN ('admin','teacher','student','parent')),
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(150),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- ── CLASSES ───────────────────────────────────────────────────────────────
CREATE TABLE classes (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) UNIQUE NOT NULL,  -- e.g. "10th Standard"
  sections      TEXT[],                         -- e.g. {A, B, C}
  students_count INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── TEACHERS ──────────────────────────────────────────────────────────────
CREATE TABLE teachers (
  id              SERIAL PRIMARY KEY,
  teacher_id      VARCHAR(20) UNIQUE NOT NULL,  -- e.g. TCH001
  user_id         INT REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(120) NOT NULL,
  department      VARCHAR(100),
  subjects        TEXT,
  phone           VARCHAR(20),
  class_assigned  VARCHAR(120) REFERENCES classes(name) ON DELETE SET NULL,
  status          VARCHAR(20) DEFAULT 'Full-Time',
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── STUDENTS ──────────────────────────────────────────────────────────────
CREATE TABLE students (
  id              SERIAL PRIMARY KEY,
  student_id      VARCHAR(20) UNIQUE NOT NULL,   -- e.g. STU001
  user_id         INT REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(120) NOT NULL,
  class_name      VARCHAR(120) REFERENCES classes(name) ON DELETE SET NULL,
  section         VARCHAR(5) DEFAULT 'A',
  phone           VARCHAR(20),
  attendance_pct  DECIMAL(5,2) DEFAULT 100.00,
  fee_status      VARCHAR(20) DEFAULT 'Unpaid' CHECK (fee_status IN ('Paid','Partial','Unpaid')),
  admitted_on     DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── PARENTS ───────────────────────────────────────────────────────────────
CREATE TABLE parents (
  id              SERIAL PRIMARY KEY,
  parent_id       VARCHAR(20) UNIQUE NOT NULL,   -- e.g. PAR001
  user_id         INT REFERENCES users(id) ON DELETE CASCADE,
  student_id      INT REFERENCES students(id) ON DELETE CASCADE,
  name            VARCHAR(120) NOT NULL,
  phone           VARCHAR(20),
  email           VARCHAR(150),
  relation        VARCHAR(30) DEFAULT 'Parent',
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── SUBJECTS ──────────────────────────────────────────────────────────────
CREATE TABLE subjects (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(30) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  class_name    VARCHAR(120) REFERENCES classes(name) ON DELETE CASCADE,
  teacher_id    VARCHAR(20) REFERENCES teachers(teacher_id) ON DELETE SET NULL,
  periods_week  INT DEFAULT 5,
  type          VARCHAR(30) DEFAULT 'Core',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── ATTENDANCE ────────────────────────────────────────────────────────────
CREATE TABLE attendance (
  id            SERIAL PRIMARY KEY,
  student_id    INT REFERENCES students(id) ON DELETE CASCADE,
  class_name    VARCHAR(120),
  section       VARCHAR(5),
  date          DATE NOT NULL,
  status        CHAR(1) NOT NULL CHECK (status IN ('P','A','L')),  -- Present/Absent/Leave
  marked_by     VARCHAR(20),  -- teacher_id
  created_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, date)
);

-- ── FEES ──────────────────────────────────────────────────────────────────
CREATE TABLE fees (
  id              SERIAL PRIMARY KEY,
  student_id      INT REFERENCES students(id) ON DELETE CASCADE,
  academic_year   VARCHAR(20) DEFAULT '2026-2027',
  term            VARCHAR(30),
  amount_due      DECIMAL(10,2) DEFAULT 25000,
  amount_paid     DECIMAL(10,2) DEFAULT 0,
  balance         DECIMAL(10,2) GENERATED ALWAYS AS (amount_due - amount_paid) STORED,
  payment_date    DATE,
  payment_mode    VARCHAR(30),
  receipt_no      VARCHAR(30),
  status          VARCHAR(20) DEFAULT 'Unpaid',
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── ASSIGNMENTS ───────────────────────────────────────────────────────────
CREATE TABLE assignments (
  id            SERIAL PRIMARY KEY,
  asn_id        VARCHAR(20) UNIQUE NOT NULL,
  title         VARCHAR(200) NOT NULL,
  class_name    VARCHAR(120),
  section       VARCHAR(5),
  subject       VARCHAR(100),
  due_date      DATE,
  max_marks     INT DEFAULT 50,
  instructions  TEXT,
  teacher_id    VARCHAR(20),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── SUBMISSIONS ───────────────────────────────────────────────────────────
CREATE TABLE submissions (
  id              SERIAL PRIMARY KEY,
  assignment_id   INT REFERENCES assignments(id) ON DELETE CASCADE,
  student_id      INT REFERENCES students(id) ON DELETE CASCADE,
  submitted_at    TIMESTAMP DEFAULT NOW(),
  content         TEXT,
  marks_obtained  INT,
  feedback        TEXT,
  status          VARCHAR(20) DEFAULT 'Submitted',
  UNIQUE (assignment_id, student_id)
);

-- ── RESULTS ───────────────────────────────────────────────────────────────
CREATE TABLE results (
  id            SERIAL PRIMARY KEY,
  student_id    INT REFERENCES students(id) ON DELETE CASCADE,
  subject       VARCHAR(100) NOT NULL,
  exam_name     VARCHAR(100),
  max_marks     INT DEFAULT 100,
  obtained      INT,
  grade         VARCHAR(5),
  remarks       TEXT,
  exam_date     DATE DEFAULT CURRENT_DATE,
  published_by  VARCHAR(20),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── NOTICES ───────────────────────────────────────────────────────────────
CREATE TABLE notices (
  id            SERIAL PRIMARY KEY,
  message       TEXT NOT NULL,
  posted_by     VARCHAR(120) DEFAULT 'Administration',
  posted_at     TIMESTAMP DEFAULT NOW(),
  is_active     BOOLEAN DEFAULT TRUE
);

-- ── MATERIALS ─────────────────────────────────────────────────────────────
CREATE TABLE materials (
  id            SERIAL PRIMARY KEY,
  mat_id        VARCHAR(20) UNIQUE NOT NULL,
  title         VARCHAR(200) NOT NULL,
  type          VARCHAR(50),         -- PDF, Video, PPT, etc.
  subject       VARCHAR(100),
  class_name    VARCHAR(120),
  link          TEXT,
  teacher_id    VARCHAR(20),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── TIMETABLE ─────────────────────────────────────────────────────────────
CREATE TABLE timetable (
  id            SERIAL PRIMARY KEY,
  class_name    VARCHAR(120),
  section       VARCHAR(5),
  day           VARCHAR(10),          -- Monday, Tuesday, etc.
  period        INT,                  -- 1-8
  subject       VARCHAR(100),
  teacher_id    VARCHAR(20),
  start_time    TIME,
  end_time      TIME,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────────────────────
CREATE INDEX idx_students_class ON students(class_name);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_assignments_class ON assignments(class_name);
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_role ON users(role);

COMMENT ON TABLE users IS 'Authentication table for all portal users';
COMMENT ON TABLE students IS 'Student records (LKG to 12th Standard)';
COMMENT ON TABLE teachers IS 'Faculty directory';
COMMENT ON TABLE parents IS 'Parent/guardian records linked to students';

-- ── ROLE CREATION AND PRIVILEGES ───────────────────────────────────────────
-- Create the non-superuser application role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'edusphere_app') THEN
    CREATE ROLE edusphere_app WITH LOGIN PASSWORD 'edusphere_password';
  END IF;
END
$$;

-- Grant permissions to the application role
DO $$
BEGIN
  EXECUTE 'GRANT CONNECT ON DATABASE ' || quote_ident(current_database()) || ' TO edusphere_app';
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END
$$;
GRANT USAGE ON SCHEMA public TO edusphere_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO edusphere_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO edusphere_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO edusphere_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO edusphere_app;

-- ── ENABLE ROW LEVEL SECURITY ─────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE classes FORCE ROW LEVEL SECURITY;
ALTER TABLE teachers FORCE ROW LEVEL SECURITY;
ALTER TABLE students FORCE ROW LEVEL SECURITY;
ALTER TABLE parents FORCE ROW LEVEL SECURITY;
ALTER TABLE subjects FORCE ROW LEVEL SECURITY;
ALTER TABLE attendance FORCE ROW LEVEL SECURITY;
ALTER TABLE fees FORCE ROW LEVEL SECURITY;
ALTER TABLE assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE results FORCE ROW LEVEL SECURITY;
ALTER TABLE notices FORCE ROW LEVEL SECURITY;
ALTER TABLE materials FORCE ROW LEVEL SECURITY;
ALTER TABLE timetable FORCE ROW LEVEL SECURITY;

-- ── RLS POLICIES ───────────────────────────────────────────────────────────

-- 1. USERS POLICIES
CREATE POLICY user_select_all ON users FOR SELECT TO edusphere_app
  USING (true);

CREATE POLICY user_admin_all ON users FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY user_self_update ON users FOR UPDATE TO edusphere_app
  USING (user_id = current_setting('app.current_user_id', true))
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- 2. CLASSES POLICIES
CREATE POLICY class_admin_all ON classes FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY class_auth_select ON classes FOR SELECT TO edusphere_app
  USING (current_setting('app.current_user_role', true) IS NOT NULL);

-- 3. TEACHERS POLICIES
CREATE POLICY teacher_admin_all ON teachers FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY teacher_auth_select ON teachers FOR SELECT TO edusphere_app
  USING (current_setting('app.current_user_role', true) IS NOT NULL);

-- 4. STUDENTS POLICIES
CREATE POLICY student_staff_all ON students FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) IN ('admin', 'teacher'))
  WITH CHECK (current_setting('app.current_user_role', true) IN ('admin', 'teacher'));

CREATE POLICY student_self_select ON students FOR SELECT TO edusphere_app
  USING (student_id = current_setting('app.current_user_id', true));

CREATE POLICY student_parent_select ON students FOR SELECT TO edusphere_app
  USING (id IN (
    SELECT student_id FROM parents WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

-- 5. PARENTS POLICIES
CREATE POLICY parent_staff_all ON parents FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) IN ('admin', 'teacher'))
  WITH CHECK (current_setting('app.current_user_role', true) IN ('admin', 'teacher'));

CREATE POLICY parent_self_select_update ON parents FOR ALL TO edusphere_app
  USING (user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer)
  WITH CHECK (user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer);

-- 6. SUBJECTS POLICIES
CREATE POLICY subject_admin_all ON subjects FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY subject_auth_select ON subjects FOR SELECT TO edusphere_app
  USING (current_setting('app.current_user_role', true) IS NOT NULL);

-- 7. ATTENDANCE POLICIES
CREATE POLICY attendance_staff_all ON attendance FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) IN ('admin', 'teacher'))
  WITH CHECK (current_setting('app.current_user_role', true) IN ('admin', 'teacher'));

CREATE POLICY attendance_student_select ON attendance FOR SELECT TO edusphere_app
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

CREATE POLICY attendance_parent_select ON attendance FOR SELECT TO edusphere_app
  USING (student_id IN (
    SELECT student_id FROM parents WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

-- 8. FEES POLICIES
CREATE POLICY fee_admin_all ON fees FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY fee_student_select ON fees FOR SELECT TO edusphere_app
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

CREATE POLICY fee_parent_select ON fees FOR SELECT TO edusphere_app
  USING (student_id IN (
    SELECT student_id FROM parents WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

-- 9. ASSIGNMENTS POLICIES
CREATE POLICY assignment_admin_all ON assignments FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY assignment_teacher_all ON assignments FOR ALL TO edusphere_app
  USING (teacher_id = current_setting('app.current_user_id', true))
  WITH CHECK (teacher_id = current_setting('app.current_user_id', true));

CREATE POLICY assignment_student_select ON assignments FOR SELECT TO edusphere_app
  USING (class_name = (
    SELECT class_name FROM students WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

CREATE POLICY assignment_parent_select ON assignments FOR SELECT TO edusphere_app
  USING (class_name = (
    SELECT class_name FROM students WHERE id = (
      SELECT student_id FROM parents WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
    )
  ));

-- 10. SUBMISSIONS POLICIES
CREATE POLICY submission_staff_all ON submissions FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) IN ('admin', 'teacher'))
  WITH CHECK (current_setting('app.current_user_role', true) IN ('admin', 'teacher'));

CREATE POLICY submission_student_all ON submissions FOR ALL TO edusphere_app
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ))
  WITH CHECK (student_id IN (
    SELECT id FROM students WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

CREATE POLICY submission_parent_select ON submissions FOR SELECT TO edusphere_app
  USING (student_id IN (
    SELECT student_id FROM parents WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

-- 11. RESULTS POLICIES
CREATE POLICY result_staff_all ON results FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) IN ('admin', 'teacher'))
  WITH CHECK (current_setting('app.current_user_role', true) IN ('admin', 'teacher'));

CREATE POLICY result_student_select ON results FOR SELECT TO edusphere_app
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

CREATE POLICY result_parent_select ON results FOR SELECT TO edusphere_app
  USING (student_id IN (
    SELECT student_id FROM parents WHERE user_id = NULLIF(current_setting('app.current_db_id', true), '')::integer
  ));

-- 12. NOTICES POLICIES
CREATE POLICY notice_admin_all ON notices FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY notice_auth_select ON notices FOR SELECT TO edusphere_app
  USING (current_setting('app.current_user_role', true) IS NOT NULL);

-- 13. MATERIALS POLICIES
CREATE POLICY material_staff_all ON materials FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) IN ('admin', 'teacher'))
  WITH CHECK (current_setting('app.current_user_role', true) IN ('admin', 'teacher'));

CREATE POLICY material_auth_select ON materials FOR SELECT TO edusphere_app
  USING (current_setting('app.current_user_role', true) IS NOT NULL);

-- 14. TIMETABLE POLICIES
CREATE POLICY timetable_admin_all ON timetable FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY timetable_auth_select ON timetable FOR SELECT TO edusphere_app
  USING (current_setting('app.current_user_role', true) IS NOT NULL);

-- ── LIBRARY BOOKS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS library_books (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(30) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── LIBRARY ISSUES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS library_issues (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(30) REFERENCES library_books(isbn) ON DELETE CASCADE,
  student_id VARCHAR(20) NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  return_date DATE,
  status VARCHAR(20) DEFAULT 'issued' -- issued, returned, overdue
);

-- ── TRANSPORT VEHICLES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transport_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_no VARCHAR(20) UNIQUE NOT NULL,
  route_name VARCHAR(150),
  driver_name VARCHAR(100),
  driver_phone VARCHAR(20),
  capacity INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── TRANSPORT ASSIGNMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transport_assignments (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  student_id VARCHAR(20) NOT NULL,
  pickup_point VARCHAR(150)
);

-- ── SYSTEM SETTINGS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT
);

-- Enable RLS
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE library_books FORCE ROW LEVEL SECURITY;
ALTER TABLE library_issues FORCE ROW LEVEL SECURITY;
ALTER TABLE transport_vehicles FORCE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE settings FORCE ROW LEVEL SECURITY;

-- Grant privileges
GRANT ALL PRIVILEGES ON TABLE library_books, library_issues, transport_vehicles, transport_assignments, settings TO edusphere_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO edusphere_app;

-- RLS Policies
CREATE POLICY library_books_select ON library_books FOR SELECT TO edusphere_app USING (true);
CREATE POLICY library_books_admin ON library_books FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY library_issues_admin ON library_issues FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');
CREATE POLICY library_issues_student ON library_issues FOR SELECT TO edusphere_app USING (student_id = current_setting('app.current_user_id', true));

CREATE POLICY transport_vehicles_select ON transport_vehicles FOR SELECT TO edusphere_app USING (true);
CREATE POLICY transport_vehicles_admin ON transport_vehicles FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY transport_assignments_admin ON transport_assignments FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');
CREATE POLICY transport_assignments_student ON transport_assignments FOR SELECT TO edusphere_app USING (student_id = current_setting('app.current_user_id', true));

CREATE POLICY settings_select ON settings FOR SELECT TO edusphere_app USING (true);
CREATE POLICY settings_admin ON settings FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');

-- ── EXAMS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exams (
  id            SERIAL PRIMARY KEY,
  exam_id       VARCHAR(20) UNIQUE NOT NULL,
  title         VARCHAR(200) NOT NULL,
  class_name    VARCHAR(120),
  section       VARCHAR(5),
  subject       VARCHAR(100),
  exam_type     VARCHAR(50) DEFAULT 'Quarterly',
  exam_date     DATE,
  max_marks     INT DEFAULT 100,
  duration_mins INT DEFAULT 180,
  teacher_id    VARCHAR(20),
  status        VARCHAR(20) DEFAULT 'Scheduled',
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ── MESSAGES TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  sender_id   VARCHAR(30) NOT NULL,
  receiver_id VARCHAR(30) NOT NULL,
  room_id     VARCHAR(100) NOT NULL,
  content     TEXT NOT NULL,
  sent_at     TIMESTAMP DEFAULT NOW(),
  is_read     BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Enable RLS and Force RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams FORCE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;

-- Grant privileges
GRANT ALL PRIVILEGES ON TABLE exams, messages TO edusphere_app;

-- Exams RLS Policies
CREATE POLICY exams_admin_all ON exams FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');

CREATE POLICY exams_teacher_own ON exams FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'teacher')
  WITH CHECK (current_setting('app.current_user_role', true) = 'teacher');

CREATE POLICY exams_student_class ON exams FOR SELECT TO edusphere_app
  USING (
    current_setting('app.current_user_role', true) = 'student' AND
    (class_name IS NULL OR class_name = (
      SELECT class_name FROM students
      WHERE user_id = NULLIF(current_setting('app.current_db_id', true),'')::int
    ))
  );

CREATE POLICY exams_parent_class ON exams FOR SELECT TO edusphere_app
  USING (
    current_setting('app.current_user_role', true) = 'parent' AND
    (class_name IS NULL OR class_name = (
      SELECT class_name FROM students WHERE id = (
        SELECT student_id FROM parents
        WHERE user_id = NULLIF(current_setting('app.current_db_id', true),'')::int
      )
    ))
  );

-- Messages RLS Policies
CREATE POLICY messages_own ON messages FOR ALL TO edusphere_app
  USING (
    sender_id   = current_setting('app.current_user_id', true) OR
    receiver_id = current_setting('app.current_user_id', true)
  )
  WITH CHECK (
    sender_id = current_setting('app.current_user_id', true)
  );

CREATE POLICY messages_admin ON messages FOR ALL TO edusphere_app
  USING (current_setting('app.current_user_role', true) = 'admin')
  WITH CHECK (current_setting('app.current_user_role', true) = 'admin');


