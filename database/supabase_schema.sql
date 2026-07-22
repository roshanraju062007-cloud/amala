-- ============================================================
-- EduSphere LMS — Supabase Native Schema
-- Amala Higher Secondary School
-- ============================================================

-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (order matters for FK constraints)
DROP TABLE IF EXISTS library_issues CASCADE;
DROP TABLE IF EXISTS library_books CASCADE;
DROP TABLE IF EXISTS transport_assignments CASCADE;
DROP TABLE IF EXISTS transport_vehicles CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS uploaded_timetables CASCADE;
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

-- ── USERS (Maps 1:1 with Supabase auth.users) ────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id       VARCHAR(30) UNIQUE NOT NULL,   -- e.g. admin, TCH001, STU001, PAR001
  avatar        VARCHAR(255),                   -- profile photo URL (Supabase Storage)
  role          VARCHAR(10) NOT NULL CHECK (role IN ('admin','teacher','student','parent')),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(150),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── HELPER FUNCTIONS FOR RLS ──────────────────────────────────────────────
-- These functions make RLS policies cleaner and more performant
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS VARCHAR(10) AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS VARCHAR(30) AS $$
  SELECT user_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ── CLASSES ───────────────────────────────────────────────────────────────
CREATE TABLE classes (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120) UNIQUE NOT NULL,  -- e.g. "10th Standard"
  sections      TEXT[],                        -- e.g. {A, B, C}
  students_count INT DEFAULT 0,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── TEACHERS ──────────────────────────────────────────────────────────────
CREATE TABLE teachers (
  id              SERIAL PRIMARY KEY,
  teacher_id      VARCHAR(20) UNIQUE NOT NULL,  -- e.g. TCH001
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name            VARCHAR(120) NOT NULL,
  department      VARCHAR(100),
  subjects        TEXT,
  phone           VARCHAR(20),
  email           VARCHAR(150),
  address         TEXT,
  date_joined     DATE,
  date_of_birth   DATE,
  class_assigned  VARCHAR(120) REFERENCES classes(name) ON DELETE SET NULL,
  status          VARCHAR(20) DEFAULT 'Full-Time',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── STUDENTS ──────────────────────────────────────────────────────────────
CREATE TABLE students (
  id              SERIAL PRIMARY KEY,
  student_id      VARCHAR(20) UNIQUE NOT NULL,   -- e.g. STU001
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name            VARCHAR(120) NOT NULL,
  class_name      VARCHAR(120) REFERENCES classes(name) ON DELETE SET NULL,
  section         VARCHAR(5) DEFAULT 'A',
  roll_number     VARCHAR(20),
  phone           VARCHAR(20),
  gender          VARCHAR(10),
  date_of_birth   DATE,
  address         TEXT,
  attendance_pct  DECIMAL(5,2) DEFAULT 100.00,
  fee_status      VARCHAR(20) DEFAULT 'Unpaid' CHECK (fee_status IN ('Paid','Partial','Unpaid')),
  admitted_on     DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── PARENTS ───────────────────────────────────────────────────────────────
CREATE TABLE parents (
  id              SERIAL PRIMARY KEY,
  parent_id       VARCHAR(20) UNIQUE NOT NULL,   -- e.g. PAR001
  user_id         UUID REFERENCES public.users(id) ON DELETE CASCADE,
  student_id      INT REFERENCES students(id) ON DELETE CASCADE,
  name            VARCHAR(120) NOT NULL,
  phone           VARCHAR(20),
  email           VARCHAR(150),
  relation        VARCHAR(30) DEFAULT 'Parent',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── SUBMISSIONS ───────────────────────────────────────────────────────────
CREATE TABLE submissions (
  id              SERIAL PRIMARY KEY,
  assignment_id   INT REFERENCES assignments(id) ON DELETE CASCADE,
  student_id      INT REFERENCES students(id) ON DELETE CASCADE,
  submitted_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── NOTICES ───────────────────────────────────────────────────────────────
CREATE TABLE notices (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(200),
  message          TEXT NOT NULL,
  target_audience  VARCHAR(20) DEFAULT 'all',
  posted_by        VARCHAR(120) DEFAULT 'Administration',
  posted_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active        BOOLEAN DEFAULT TRUE
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
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  room_number   VARCHAR(20),
  start_time    TIME,
  end_time      TIME,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── UPLOADED TIMETABLES ───────────────────────────────────────────────────
CREATE TABLE uploaded_timetables (
  id            SERIAL PRIMARY KEY,
  class_name    VARCHAR(120) NOT NULL,
  section       VARCHAR(5) NOT NULL,
  file_path     TEXT,
  file_name     VARCHAR(255),
  file_size     INT,
  upload_date   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  external_url  TEXT,
  UNIQUE (class_name, section)
);

-- ── LIBRARY BOOKS ────────────────────────────────────────────────────────
CREATE TABLE library_books (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(30) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── LIBRARY ISSUES ───────────────────────────────────────────────────────
CREATE TABLE library_issues (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(30) REFERENCES library_books(isbn) ON DELETE CASCADE,
  student_id VARCHAR(20) NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  return_date DATE,
  status VARCHAR(20) DEFAULT 'issued' -- issued, returned, overdue
);

-- ── TRANSPORT VEHICLES ───────────────────────────────────────────────────
CREATE TABLE transport_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_no VARCHAR(20) UNIQUE NOT NULL,
  route_name VARCHAR(150),
  driver_name VARCHAR(100),
  driver_phone VARCHAR(20),
  capacity INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── TRANSPORT ASSIGNMENTS ────────────────────────────────────────────────
CREATE TABLE transport_assignments (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  student_id VARCHAR(20) NOT NULL,
  pickup_point VARCHAR(150)
);

-- ── SYSTEM SETTINGS ──────────────────────────────────────────────────────
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT
);

-- ── EXAMS TABLE ────────────────────────────────────────────────────────
CREATE TABLE exams (
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
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── MESSAGES TABLE (Realtime) ─────────────────────────────────────────────
CREATE TABLE messages (
  id          SERIAL PRIMARY KEY,
  sender_id   VARCHAR(30) NOT NULL,
  receiver_id VARCHAR(30) NOT NULL,
  room_id     VARCHAR(100) NOT NULL,
  content     TEXT NOT NULL,
  sent_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read     BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_messages_room ON messages(room_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Enable Supabase Realtime for Messages
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table messages;

-- ── INDEXES ───────────────────────────────────────────────────────────────
CREATE INDEX idx_students_class ON students(class_name);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_assignments_class ON assignments(class_name);
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_role ON users(role);

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
ALTER TABLE uploaded_timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ── RLS POLICIES (Using Supabase Auth) ────────────────────────────────────

-- 1. USERS POLICIES
CREATE POLICY user_select_all ON users FOR SELECT USING (true);
CREATE POLICY user_admin_all ON users FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY user_self_update ON users FOR UPDATE USING (id = auth.uid());

-- 2. CLASSES POLICIES
CREATE POLICY class_admin_all ON classes FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY class_auth_select ON classes FOR SELECT USING (auth.uid() IS NOT NULL);

-- 3. TEACHERS POLICIES
CREATE POLICY teacher_admin_all ON teachers FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY teacher_auth_select ON teachers FOR SELECT USING (auth.uid() IS NOT NULL);

-- 4. STUDENTS POLICIES
CREATE POLICY student_staff_all ON students FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY student_self_select ON students FOR SELECT USING (user_id = auth.uid());
CREATE POLICY student_parent_select ON students FOR SELECT USING (
  id IN (SELECT student_id FROM parents WHERE user_id = auth.uid())
);

-- 5. PARENTS POLICIES
CREATE POLICY parent_staff_all ON parents FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY parent_self_select_update ON parents FOR ALL USING (user_id = auth.uid());

-- 6. SUBJECTS POLICIES
CREATE POLICY subject_admin_all ON subjects FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY subject_auth_select ON subjects FOR SELECT USING (auth.uid() IS NOT NULL);

-- 7. ATTENDANCE POLICIES
CREATE POLICY attendance_staff_all ON attendance FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY attendance_student_select ON attendance FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);
CREATE POLICY attendance_parent_select ON attendance FOR SELECT USING (
  student_id IN (SELECT student_id FROM parents WHERE user_id = auth.uid())
);

-- 8. FEES POLICIES
CREATE POLICY fee_admin_all ON fees FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY fee_student_select ON fees FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);
CREATE POLICY fee_parent_select ON fees FOR SELECT USING (
  student_id IN (SELECT student_id FROM parents WHERE user_id = auth.uid())
);

-- 9. ASSIGNMENTS POLICIES
CREATE POLICY assignment_admin_all ON assignments FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY assignment_teacher_all ON assignments FOR ALL USING (public.get_my_user_id() = teacher_id);
CREATE POLICY assignment_student_select ON assignments FOR SELECT USING (
  class_name = (SELECT class_name FROM students WHERE user_id = auth.uid())
);
CREATE POLICY assignment_parent_select ON assignments FOR SELECT USING (
  class_name = (SELECT class_name FROM students WHERE id IN (SELECT student_id FROM parents WHERE user_id = auth.uid()))
);

-- 10. SUBMISSIONS POLICIES
CREATE POLICY submission_staff_all ON submissions FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY submission_student_all ON submissions FOR ALL USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);
CREATE POLICY submission_parent_select ON submissions FOR SELECT USING (
  student_id IN (SELECT student_id FROM parents WHERE user_id = auth.uid())
);

-- 11. RESULTS POLICIES
CREATE POLICY result_staff_all ON results FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY result_student_select ON results FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);
CREATE POLICY result_parent_select ON results FOR SELECT USING (
  student_id IN (SELECT student_id FROM parents WHERE user_id = auth.uid())
);

-- 12. NOTICES POLICIES
CREATE POLICY notice_admin_all ON notices FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY notice_auth_select ON notices FOR SELECT USING (auth.uid() IS NOT NULL);

-- 13. MATERIALS POLICIES
CREATE POLICY material_staff_all ON materials FOR ALL USING (public.get_my_role() IN ('admin', 'teacher'));
CREATE POLICY material_auth_select ON materials FOR SELECT USING (auth.uid() IS NOT NULL);

-- 14. TIMETABLE POLICIES
CREATE POLICY timetable_admin_all ON timetable FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY timetable_auth_select ON timetable FOR SELECT USING (auth.uid() IS NOT NULL);

-- 15. UPLOADED TIMETABLES POLICIES
CREATE POLICY uploaded_timetables_admin_all ON uploaded_timetables FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY uploaded_timetables_auth_select ON uploaded_timetables FOR SELECT USING (auth.uid() IS NOT NULL);

-- 16. LIBRARY POLICIES
CREATE POLICY library_books_select ON library_books FOR SELECT USING (true);
CREATE POLICY library_books_admin ON library_books FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY library_issues_admin ON library_issues FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY library_issues_student ON library_issues FOR SELECT USING (
  student_id = public.get_my_user_id()
);

-- 17. TRANSPORT POLICIES
CREATE POLICY transport_vehicles_select ON transport_vehicles FOR SELECT USING (true);
CREATE POLICY transport_vehicles_admin ON transport_vehicles FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY transport_assignments_admin ON transport_assignments FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY transport_assignments_student ON transport_assignments FOR SELECT USING (
  student_id = public.get_my_user_id()
);

-- 18. EXAMS POLICIES
CREATE POLICY exams_admin_all ON exams FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY exams_teacher_own ON exams FOR ALL USING (public.get_my_role() = 'teacher');
CREATE POLICY exams_student_class ON exams FOR SELECT USING (
  public.get_my_role() = 'student' AND (class_name IS NULL OR class_name = (SELECT class_name FROM students WHERE user_id = auth.uid()))
);
CREATE POLICY exams_parent_class ON exams FOR SELECT USING (
  public.get_my_role() = 'parent' AND (class_name IS NULL OR class_name = (SELECT class_name FROM students WHERE id IN (SELECT student_id FROM parents WHERE user_id = auth.uid())))
);

-- 19. MESSAGES POLICIES
CREATE POLICY messages_own ON messages FOR ALL USING (
  sender_id = public.get_my_user_id() OR receiver_id = public.get_my_user_id()
);
CREATE POLICY messages_admin ON messages FOR ALL USING (public.get_my_role() = 'admin');

-- 20. SETTINGS POLICIES
CREATE POLICY settings_select ON settings FOR SELECT USING (true);
CREATE POLICY settings_admin ON settings FOR ALL USING (public.get_my_role() = 'admin');


-- ============================================================
-- SEED ADMIN USER
-- ============================================================
-- To insert a user into Supabase Auth via SQL, we need to create the auth.users record,
-- then our public.users record.

DO $$
DECLARE
  new_admin_id uuid := gen_random_uuid();
BEGIN
  -- 1. Create the user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_admin_id,
    'authenticated',
    'authenticated',
    'admin@amala.edu',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  );

  -- 2. Create the corresponding record in public.users
  INSERT INTO public.users (
    id,
    user_id,
    role,
    name,
    email,
    is_active
  ) VALUES (
    new_admin_id,
    'admin',
    'admin',
    'System Administrator',
    'admin@amala.edu',
    true
  );
END $$;
