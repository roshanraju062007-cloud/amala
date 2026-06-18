-- ============================================================
-- EduSphere LMS — PostgreSQL Schema
-- Amala Higher Secondary School
-- ============================================================

-- Drop existing tables (order matters for FK constraints)
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
