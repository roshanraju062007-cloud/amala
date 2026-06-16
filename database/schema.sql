-- EduSphere LMS Database Schema
-- Amala Higher Secondary School

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(20) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('admin','teacher','student','parent'),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  father_name VARCHAR(100),
  mother_name VARCHAR(100),
  father_phone VARCHAR(15),
  mother_phone VARCHAR(15),
  email VARCHAR(100),
  occupation VARCHAR(100),
  address TEXT
);

CREATE TABLE IF NOT EXISTS teachers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  employee_id VARCHAR(20) UNIQUE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  department VARCHAR(50),
  qualification VARCHAR(100),
  experience_years INT,
  phone VARCHAR(15),
  address TEXT,
  joining_date DATE,
  salary DECIMAL(10,2),
  photo_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(20),
  level INT,
  stream VARCHAR(20),
  class_teacher_id INT REFERENCES teachers(id)
);

CREATE TABLE IF NOT EXISTS sections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT REFERENCES classes(id),
  name VARCHAR(5),
  capacity INT DEFAULT 40
);

CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT REFERENCES users(id),
  admission_no VARCHAR(20) UNIQUE,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  dob DATE,
  gender ENUM('Male','Female','Other'),
  class_id INT REFERENCES classes(id),
  section_id INT REFERENCES sections(id),
  roll_no INT,
  aadhar VARCHAR(12),
  blood_group VARCHAR(5),
  address TEXT,
  parent_id INT REFERENCES parents(id),
  admission_date DATE,
  photo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  code VARCHAR(20),
  class_id INT REFERENCES classes(id),
  teacher_id INT REFERENCES teachers(id),
  periods_per_week INT,
  type ENUM('Core','Elective','Language','Lab')
);

CREATE TABLE IF NOT EXISTS timetable (
  id INT PRIMARY KEY AUTO_INCREMENT,
  section_id INT REFERENCES sections(id),
  subject_id INT REFERENCES subjects(id),
  teacher_id INT REFERENCES teachers(id),
  day ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),
  period_no INT,
  start_time TIME,
  end_time TIME
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT REFERENCES students(id),
  date DATE,
  status ENUM('Present','Absent','Late','Half-Day'),
  arrival_time TIME,
  marked_by INT REFERENCES teachers(id),
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY (student_id, date)
);

CREATE TABLE IF NOT EXISTS exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  type ENUM('Unit Test','Monthly','Quarterly','Half-Yearly','Annual','Online'),
  class_id INT REFERENCES classes(id),
  start_date DATE,
  end_date DATE,
  max_marks INT,
  duration_minutes INT,
  is_online BOOLEAN DEFAULT FALSE,
  status ENUM('Draft','Scheduled','Ongoing','Completed')
);

CREATE TABLE IF NOT EXISTS results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT REFERENCES students(id),
  exam_id INT REFERENCES exams(id),
  subject_id INT REFERENCES subjects(id),
  marks_obtained DECIMAL(5,2),
  max_marks INT,
  grade VARCHAR(5),
  is_passed BOOLEAN,
  remarks VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  subject_id INT REFERENCES subjects(id),
  teacher_id INT REFERENCES teachers(id),
  class_id INT REFERENCES classes(id),
  section_id INT REFERENCES sections(id),
  instructions TEXT,
  file_url VARCHAR(255),
  due_date DATETIME,
  max_marks INT,
  allow_late BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT REFERENCES assignments(id),
  student_id INT REFERENCES students(id),
  file_url VARCHAR(255),
  submitted_at DATETIME,
  marks_obtained DECIMAL(5,2),
  grade VARCHAR(5),
  feedback TEXT,
  is_late BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS study_materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  subject_id INT REFERENCES subjects(id),
  teacher_id INT REFERENCES teachers(id),
  type ENUM('PDF','PPT','Video','Audio','E-book','Question Bank'),
  file_url VARCHAR(255),
  description TEXT,
  download_count INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_structure (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT REFERENCES classes(id),
  fee_type VARCHAR(50),
  amount DECIMAL(10,2),
  academic_year VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT REFERENCES students(id),
  fee_structure_id INT REFERENCES fee_structure(id),
  amount_paid DECIMAL(10,2),
  payment_date DATE,
  payment_mode ENUM('Cash','Online','Cheque','Card','UPI'),
  transaction_id VARCHAR(100),
  receipt_no VARCHAR(20) UNIQUE,
  collected_by INT REFERENCES users(id),
  remarks VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  message TEXT,
  sent_by INT REFERENCES users(id),
  recipient_role ENUM('All','Admin','Teacher','Student','Parent'),
  class_id INT,
  channel_app BOOLEAN DEFAULT TRUE,
  channel_email BOOLEAN DEFAULT FALSE,
  channel_sms BOOLEAN DEFAULT FALSE,
  channel_whatsapp BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Draft','Sent','Scheduled')
);

CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT REFERENCES users(id),
  receiver_id INT REFERENCES users(id),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  isbn VARCHAR(20),
  title VARCHAR(200),
  author VARCHAR(100),
  category VARCHAR(50),
  total_copies INT,
  available_copies INT,
  shelf_location VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS book_issues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_id INT REFERENCES books(id),
  student_id INT REFERENCES students(id),
  issue_date DATE,
  due_date DATE,
  return_date DATE,
  fine_amount DECIMAL(5,2) DEFAULT 0,
  status ENUM('Issued','Returned','Overdue')
);

CREATE TABLE IF NOT EXISTS routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  route_no VARCHAR(10),
  area VARCHAR(100),
  driver_name VARCHAR(100),
  driver_phone VARCHAR(15),
  vehicle_no VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS route_stops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  route_id INT REFERENCES routes(id),
  stop_name VARCHAR(100),
  stop_order INT,
  pickup_time TIME
);

CREATE TABLE IF NOT EXISTS student_routes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT REFERENCES students(id),
  route_id INT REFERENCES routes(id),
  stop_id INT REFERENCES route_stops(id)
);

CREATE TABLE IF NOT EXISTS questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subject_id INT REFERENCES subjects(id),
  class_id INT REFERENCES classes(id),
  question_text TEXT,
  type ENUM('MCQ','Short Answer','Essay','True/False'),
  option_a VARCHAR(255),
  option_b VARCHAR(255),
  option_c VARCHAR(255),
  option_d VARCHAR(255),
  correct_answer VARCHAR(255),
  marks INT DEFAULT 1,
  difficulty ENUM('Easy','Medium','Hard'),
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_by INT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS exam_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT REFERENCES exams(id),
  question_id INT REFERENCES questions(id),
  question_order INT
);

CREATE TABLE IF NOT EXISTS exam_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT REFERENCES exams(id),
  student_id INT REFERENCES students(id),
  question_id INT REFERENCES questions(id),
  student_answer TEXT,
  is_correct BOOLEAN,
  marks_obtained DECIMAL(4,2),
  start_time DATETIME,
  submit_time DATETIME
);
