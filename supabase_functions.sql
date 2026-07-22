-- ============================================================================
-- EduSphere LMS — Supabase RPC Functions
-- Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- Enable pgcrypto extension (needed for bcrypt password verification)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. AUTHENTICATE USER (Login)
-- Called by: js/login.js via supabase.rpc('authenticate_user', {...})
-- ============================================================================
CREATE OR REPLACE FUNCTION authenticate_user(
  p_user_id TEXT,
  p_password TEXT,
  p_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_child_id TEXT := NULL;
BEGIN
  -- Find active user
  SELECT id, user_id, password, role, name, email, avatar
  INTO v_user
  FROM users
  WHERE user_id = TRIM(p_user_id) AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid User ID or Password.');
  END IF;

  -- Check role matches
  IF v_user.role != p_role THEN
    RETURN jsonb_build_object('success', false, 'message',
      format('This User ID is registered as "%s", not "%s". Please select the correct role tab.', v_user.role, p_role));
  END IF;

  -- Verify password with bcrypt
  IF NOT (v_user.password = crypt(p_password, v_user.password)) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid User ID or Password.');
  END IF;

  -- For parent role: get child student ID
  IF p_role = 'parent' THEN
    SELECT s.student_id INTO v_child_id
    FROM parents p
    JOIN students s ON p.student_id = s.id
    WHERE p.user_id = v_user.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'user', jsonb_build_object(
      'userId', v_user.user_id,
      'name', v_user.name,
      'role', v_user.role,
      'email', v_user.email,
      'avatar', v_user.avatar,
      'childId', v_child_id
    )
  );
END;
$$;

-- ============================================================================
-- 2. CHANGE USER PASSWORD
-- Called by: profile/settings pages
-- ============================================================================
CREATE OR REPLACE FUNCTION change_user_password(
  p_user_id TEXT,
  p_old_password TEXT,
  p_new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_new_hash TEXT;
BEGIN
  SELECT password INTO v_user FROM users WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found.');
  END IF;

  -- Verify old password
  IF NOT (v_user.password = crypt(p_old_password, v_user.password)) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Incorrect current password.');
  END IF;

  -- Hash new password
  v_new_hash := crypt(p_new_password, gen_salt('bf', 10));

  UPDATE users SET password = v_new_hash, updated_at = NOW() WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Password updated successfully.');
END;
$$;

-- ============================================================================
-- 3. ADMIN UPDATE CREDENTIALS
-- Called by: admin credential management
-- ============================================================================
CREATE OR REPLACE FUNCTION admin_update_credentials(
  p_role TEXT,
  p_old_id TEXT,
  p_new_username TEXT,
  p_new_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target_user_id INTEGER;
  v_old_username TEXT;
  v_new_hash TEXT;
BEGIN
  -- Find the target user based on role
  IF p_role = 'teacher' THEN
    SELECT user_id, teacher_id INTO v_target_user_id, v_old_username FROM teachers WHERE teacher_id = p_old_id;
  ELSIF p_role = 'student' THEN
    SELECT user_id, student_id INTO v_target_user_id, v_old_username FROM students WHERE student_id = p_old_id;
  ELSIF p_role = 'parent' THEN
    SELECT user_id, parent_id INTO v_target_user_id, v_old_username FROM parents WHERE parent_id = p_old_id;
  END IF;

  IF v_target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', format('%s with ID %s not found.', p_role, p_old_id));
  END IF;

  -- Check if new username is taken
  IF EXISTS (SELECT 1 FROM users WHERE user_id = TRIM(p_new_username) AND id != v_target_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', format('Username "%s" is already taken.', p_new_username));
  END IF;

  -- Update user credentials
  IF p_new_password IS NOT NULL AND p_new_password != '' THEN
    v_new_hash := crypt(TRIM(p_new_password), gen_salt('bf', 10));
    UPDATE users SET user_id = TRIM(p_new_username), password = v_new_hash, raw_password = TRIM(p_new_password), updated_at = NOW()
    WHERE id = v_target_user_id;
  ELSE
    UPDATE users SET user_id = TRIM(p_new_username), updated_at = NOW() WHERE id = v_target_user_id;
  END IF;

  -- Update role-specific tables if username changed
  IF v_old_username != TRIM(p_new_username) THEN
    IF p_role = 'teacher' THEN
      UPDATE teachers SET teacher_id = TRIM(p_new_username) WHERE user_id = v_target_user_id;
      UPDATE subjects SET teacher_id = TRIM(p_new_username) WHERE teacher_id = v_old_username;
      UPDATE timetable SET teacher_id = TRIM(p_new_username) WHERE teacher_id = v_old_username;
      UPDATE materials SET teacher_id = TRIM(p_new_username) WHERE teacher_id = v_old_username;
      UPDATE assignments SET teacher_id = TRIM(p_new_username) WHERE teacher_id = v_old_username;
      UPDATE exams SET teacher_id = TRIM(p_new_username) WHERE teacher_id = v_old_username;
    ELSIF p_role = 'student' THEN
      UPDATE students SET student_id = TRIM(p_new_username) WHERE user_id = v_target_user_id;
      UPDATE library_issues SET student_id = TRIM(p_new_username) WHERE student_id = v_old_username;
      UPDATE transport_assignments SET student_id = TRIM(p_new_username) WHERE student_id = v_old_username;
    ELSIF p_role = 'parent' THEN
      UPDATE parents SET parent_id = TRIM(p_new_username) WHERE user_id = v_target_user_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Credentials updated successfully.');
END;
$$;

-- ============================================================================
-- 4. ISSUE BOOK (Library)
-- ============================================================================
CREATE OR REPLACE FUNCTION issue_book(
  p_book_id INTEGER,
  p_student_id TEXT,
  p_due_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_book RECORD;
  v_student RECORD;
BEGIN
  SELECT * INTO v_book FROM books WHERE id = p_book_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Book not found.');
  END IF;

  IF v_book.available_copies <= 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'No copies available.');
  END IF;

  SELECT * INTO v_student FROM students WHERE student_id = p_student_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Student not found.');
  END IF;

  INSERT INTO library_issues (book_id, student_id, issue_date, due_date, status)
  VALUES (p_book_id, p_student_id, CURRENT_DATE, p_due_date, 'issued');

  UPDATE books SET available_copies = available_copies - 1 WHERE id = p_book_id;

  RETURN jsonb_build_object('success', true, 'message', 'Book issued successfully.');
END;
$$;

-- ============================================================================
-- 5. RETURN BOOK (Library)
-- ============================================================================
CREATE OR REPLACE FUNCTION return_book(p_issue_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_issue RECORD;
BEGIN
  SELECT * INTO v_issue FROM library_issues WHERE id = p_issue_id AND status = 'issued';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Issue record not found or already returned.');
  END IF;

  UPDATE library_issues SET status = 'returned', return_date = CURRENT_DATE WHERE id = p_issue_id;
  UPDATE books SET available_copies = available_copies + 1 WHERE id = v_issue.book_id;

  RETURN jsonb_build_object('success', true, 'message', 'Book returned successfully.');
END;
$$;

-- ============================================================================
-- Grant execute permissions to anonymous users (via anon key)
-- ============================================================================
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION authenticate_user(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION change_user_password(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION change_user_password(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_credentials(TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION admin_update_credentials(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION issue_book(INTEGER, TEXT, DATE) TO anon;
GRANT EXECUTE ON FUNCTION issue_book(INTEGER, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION return_book(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION return_book(INTEGER) TO authenticated;

-- ============================================================================
-- Grant table-level SELECT/INSERT/UPDATE/DELETE to anon role
-- (Since we're not using Supabase Auth, the frontend uses the anon key)
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Apply to future tables too
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon;
