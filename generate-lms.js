const fs = require('fs');
const path = require('path');

// Helper to create directories recursively
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper to write files
function writeFile(filePath, content) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created: ${filePath}`);
}

console.log('Starting EduSphere LMS file generation...');

// 1. DATABASE SCHEMA
const schemaSql = `-- EduSphere LMS Database Schema
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
`;

writeFile('database/schema.sql', schemaSql);

// 2. CSS STYLES
const mainCss = `/* EduSphere LMS Design System
   AMALA HIGHER SECONDARY SCHOOL */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --primary:       #4F46E5;  /* Indigo */
  --primary-dark:  #3730A3;
  --primary-light: #EEF2FF;
  --secondary:     #06B6D4;  /* Cyan */
  --success:       #10B981;  /* Emerald */
  --warning:       #F59E0B;  /* Amber */
  --danger:        #EF4444;  /* Red */
  --info:          #3B82F6;  /* Blue */
  --dark:          #0F172A;  /* Slate 900 */
  --gray-900:      #1E293B;
  --gray-800:      #1F2937;
  --gray-700:      #334155;
  --gray-500:      #64748B;
  --gray-300:      #CBD5E1;
  --gray-100:      #F1F5F9;
  --white:         #FFFFFF;
  --sidebar-w:     260px;
  --header-h:      64px;
  --radius:        12px;
  
  --bg-app:        var(--gray-100);
  --bg-card:       var(--white);
  --text-main:     var(--dark);
  --text-muted:    var(--gray-500);
  --border-color:  var(--gray-300);
}

.dark {
  --bg-app:        #0F172A;
  --bg-card:       #1E293B;
  --text-main:     #F1F5F9;
  --text-muted:    #94A3B8;
  --border-color:  #334155;
  --white:         #1E293B;
  --gray-100:      #0F172A;
  --dark:          #F8FAFC;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-main);
  background-color: var(--bg-app);
  overflow-x: hidden;
  transition: background-color 0.3s, color 0.3s;
}

/* App Layout */
.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-w);
  background-color: #0F172A;
  color: #F8FAFC;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  transition: transform 0.3s ease;
  border-right: 1px solid #1E293B;
}

.sidebar-brand {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid #1E293B;
}

.sidebar-logo {
  width: 40px;
  height: 40px;
}

.sidebar-title {
  font-weight: 700;
  font-size: 16px;
  color: #FFF;
  line-height: 1.2;
}

.sidebar-title span {
  font-size: 10px;
  display: block;
  font-weight: 400;
  color: var(--secondary);
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 15px 10px;
  list-style: none;
}

.menu-header {
  font-size: 11px;
  text-transform: uppercase;
  color: #64748B;
  font-weight: 600;
  padding: 10px 15px 5px;
}

.sidebar-item a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  color: #94A3B8;
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius);
  margin-bottom: 4px;
  transition: all 0.2s;
}

.sidebar-item a:hover {
  background-color: #1E293B;
  color: #FFF;
}

.sidebar-item.active a {
  background-color: var(--primary);
  color: #FFF;
}

.main-content {
  margin-left: var(--sidebar-w);
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: var(--header-h);
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 90;
  transition: background-color 0.3s, border-color 0.3s;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  color: var(--text-main);
  font-size: 20px;
  cursor: pointer;
}

.page-title {
  font-weight: 700;
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--bg-app);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 20px;
}

.search-bar input {
  background: none;
  border: none;
  color: var(--text-main);
  outline: none;
  margin-left: 6px;
  width: 180px;
}

.header-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  position: relative;
}

.header-btn .badge-dot {
  width: 8px;
  height: 8px;
  background-color: var(--danger);
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary);
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.content-area {
  padding: 24px;
  flex: 1;
}

/* UI Elements */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: var(--bg-card);
  padding: 20px;
  border-radius: var(--radius);
  border-left: 5px solid var(--primary);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-info h3 {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.stat-info .stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--primary-light);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.grid-2 {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 24px;
  margin-bottom: 24px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.card {
  background-color: var(--bg-card);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Tables */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  padding: 12px 16px;
  background-color: var(--gray-100);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.data-table tbody tr:hover {
  background-color: var(--gray-100);
}

/* Badges */
.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  text-transform: uppercase;
}

.badge-success { background-color: #DEF7EC; color: #03543F; }
.badge-danger { background-color: #FDE8E8; color: #9B1C1C; }
.badge-warning { background-color: #FEF08A; color: #854D0E; }
.badge-info { background-color: #E1EFFE; color: #1E429F; }
.badge-purple { background-color: #F3E8FF; color: #6B21A8; }
.badge-gray { background-color: #F3F4F6; color: #374151; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  font-weight: 500;
  border-radius: var(--radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.btn-primary { background-color: var(--primary); color: white; }
.btn-primary:hover { background-color: var(--primary-dark); }
.btn-success { background-color: var(--success); color: white; }
.btn-danger { background-color: var(--danger); color: white; }
.btn-warning { background-color: var(--warning); color: white; }
.btn-outline { border-color: var(--border-color); background: none; color: var(--text-main); }
.btn-outline:hover { background-color: var(--gray-100); }

/* Forms */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 13px;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-card);
  color: var(--text-main);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-overlay.open {
  display: flex;
}

.modal {
  background-color: var(--bg-card);
  border-radius: var(--radius);
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
  overflow: hidden;
  animation: modalEnter 0.3s ease-out;
}

@keyframes modalEnter {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background-color: var(--gray-100);
}

/* Heatmap Calendar */
.heatmap-calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-top: 12px;
}

.heatmap-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  background-color: var(--gray-100);
  color: var(--text-muted);
}

.heatmap-present { background-color: #DEF7EC; color: #03543F; }
.heatmap-absent { background-color: #FDE8E8; color: #9B1C1C; }
.heatmap-late { background-color: #FEF08A; color: #854D0E; }
.heatmap-holiday { background-color: var(--gray-300); color: var(--gray-500); }

/* Progress bar */
.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: var(--gray-300);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

/* Tabs */
.tab-container {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
  gap: 20px;
}

.tab {
  padding: 10px 5px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
}

.tab.active {
  border-bottom-color: var(--primary);
  color: var(--primary);
}

/* Quick Action Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 24px;
}

/* Toast */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  background-color: var(--bg-card);
  color: var(--text-main);
  border-left: 4px solid var(--primary);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Responsiveness */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .grid-2 { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .main-content {
    margin-left: 0;
  }
  .hamburger {
    display: block;
  }
  .stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Print CSS */
@media print {
  .sidebar, .header, .btn, .modal-overlay, .quick-actions, .filter-bar {
    display: none !important;
  }
  .main-content {
    margin-left: 0 !important;
  }
  .content-area {
    padding: 0 !important;
  }
  .card {
    border: none !important;
    box-shadow: none !important;
  }
}
`;

writeFile('css/main.css', mainCss);

const loginCss = `/* Login specific styles */
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
  color: white;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.login-left-brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-logo {
  width: 64px;
  height: 64px;
  background-color: white;
  border-radius: 50%;
  padding: 4px;
}

.login-left-title {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.login-left-title span {
  font-size: 12px;
  font-weight: 400;
  color: #E0E7FF;
  display: block;
}

.login-hero {
  margin: 40px 0;
}

.login-hero h1 {
  font-size: 40px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 16px;
}

.login-hero p {
  font-size: 16px;
  color: #E0E7FF;
  margin-bottom: 24px;
}

.stats-mini-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-mini-card {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.stat-mini-val {
  font-size: 20px;
  font-weight: 700;
}

.stat-mini-lbl {
  font-size: 11px;
  color: #E0E7FF;
}

.login-right {
  width: 480px;
  background-color: var(--white);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-card {
  width: 100%;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.login-subtitle {
  color: var(--text-muted);
  margin-bottom: 24px;
}

.role-tabs {
  display: flex;
  background-color: var(--gray-100);
  padding: 4px;
  border-radius: var(--radius);
  margin-bottom: 24px;
}

.role-tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  font-weight: 600;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s;
}

.role-tab.active {
  background-color: var(--bg-card);
  color: var(--primary);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.demo-credentials {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--gray-100);
  border-radius: var(--radius);
}

.demo-title {
  font-weight: 600;
  font-size: 12px;
  margin-bottom: 8px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.demo-badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  background-color: var(--white);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  margin-right: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.demo-badge:hover {
  background-color: var(--primary-light);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-overlay.active {
  display: flex;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .login-left { display: none; }
  .login-right { width: 100%; padding: 24px; }
}
`;

writeFile('css/login.css', loginCss);

// 3. JAVASCRIPT SHARED APP UTILITIES
const appJs = `/* EduSphere LMS Shared Utilities */
const App = {
  toggleDark() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) toggleBtn.textContent = isDark ? '☀️' : '🌙';
  },

  initDark() {
    const savedDark = localStorage.getItem('darkMode');
    const isDark = savedDark === 'enabled' || (!savedDark && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) toggleBtn.textContent = isDark ? '☀️' : '🌙';
  },

  openModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('open');
  },

  closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('open');
  },

  showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    let borderCol = 'var(--primary)';
    if (type === 'success') borderCol = 'var(--success)';
    if (type === 'error') borderCol = 'var(--danger)';
    if (type === 'warning') borderCol = 'var(--warning)';
    toast.style.borderLeftColor = borderCol;
    toast.innerHTML = \`<span>\${msg}</span>\`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  logout() {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('userRole');
      window.location.href = '../../index.html';
    }
  },

  initSidebar() {
    const ham = document.getElementById('hamburger');
    const sidebar = document.querySelector('.sidebar');
    if (ham && sidebar) {
      ham.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
      // Click outside to close
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !ham.contains(e.target) && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    }

    // Set active link based on current page
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    const links = document.querySelectorAll('.sidebar-item a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes(pageName)) {
        link.parentElement.classList.add('active');
      } else {
        link.parentElement.classList.remove('active');
      }
    });
  }
};

// HTML5 Canvas Drawing Utilities
function drawBarChart(canvasId, labels, data, color = '#4F46E5') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  
  // Max Value
  const maxVal = Math.max(...data) * 1.2 || 10;
  
  // Draw Axes
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  const barCount = data.length;
  const spacing = chartWidth / barCount;
  const barWidth = spacing * 0.6;
  
  // Draw Bars
  for (let i = 0; i < barCount; i++) {
    const val = data[i];
    const bHeight = (val / maxVal) * chartHeight;
    const x = padding + i * spacing + (spacing - barWidth) / 2;
    const y = height - padding - bHeight;
    
    // Fill
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, bHeight);
    
    // Labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barWidth / 2, height - padding + 15);
    ctx.fillText(val, x + barWidth / 2, y - 5);
  }
}

function drawLineChart(canvasId, labels, data, color = '#10B981') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  
  const maxVal = Math.max(...data) * 1.2 || 10;
  
  // Draw Axes
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  const pointsCount = data.length;
  const spacing = chartWidth / (pointsCount - 1);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  const points = [];
  for (let i = 0; i < pointsCount; i++) {
    const val = data[i];
    const x = padding + i * spacing;
    const y = height - padding - (val / maxVal) * chartHeight;
    points.push({ x, y });
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  
  // Draw Points
  for (let i = 0; i < pointsCount; i++) {
    const p = points[i];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#64748B';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], p.x, height - padding + 15);
    ctx.fillText(data[i], p.x, p.y - 10);
  }
}

// Global hook
window.addEventListener('DOMContentLoaded', () => {
  App.initDark();
  App.initSidebar();
});
`;

writeFile('js/app.js', appJs);

// 4. JAVASCRIPT LOGIN ROUTING
const loginJs = `/* Login flow handles credentials and redirects */
document.addEventListener('DOMContentLoaded', () => {
  let activeRole = 'admin';
  const roleTabs = document.querySelectorAll('.role-tab');
  const demoList = document.getElementById('demo-list');
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('password');
  const loader = document.getElementById('loader');

  const credentials = {
    admin: { user: 'admin001', pass: 'admin123' },
    teacher: { user: 'TCH001', pass: 'teach123' },
    student: { user: 'STU001', pass: 'stud123' },
    parent: { user: 'PAR001', pass: 'par123' }
  };

  // Switch tabs
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      roleTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeRole = tab.dataset.role;
      updateDemoCredentials();
    });
  });

  function updateDemoCredentials() {
    demoList.innerHTML = '';
    const cred = credentials[activeRole];
    const badge = document.createElement('span');
    badge.className = 'demo-badge';
    badge.textContent = \`Use Demo: \${cred.user} / \${cred.pass}\`;
    badge.addEventListener('click', () => {
      emailInput.value = cred.user;
      passInput.value = cred.pass;
    });
    demoList.appendChild(badge);
  }

  // Password toggle visibility
  const togglePass = document.getElementById('togglePass');
  if (togglePass) {
    togglePass.addEventListener('click', () => {
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);
      togglePass.textContent = type === 'password' ? '👁️' : '🔒';
    });
  }

  // Handle submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userVal = emailInput.value.trim();
    const passVal = passInput.value.trim();

    if (!userVal || !passVal) {
      alert('Please enter both credentials.');
      return;
    }

    const correct = credentials[activeRole];
    if (userVal === correct.user && passVal === correct.pass) {
      loader.classList.add('active');
      setTimeout(() => {
        loader.classList.remove('active');
        localStorage.setItem('userRole', activeRole);
        window.location.href = \`pages/\${activeRole}/dashboard.html\`;
      }, 1000);
    } else {
      alert('Invalid User ID or Password. Try using the quick fill demo credentials.');
    }
  });

  // Init
  updateDemoCredentials();
});
`;

writeFile('js/login.js', loginJs);

// 5. SVG LOGO DEFINITION
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <circle cx="250" cy="250" r="230" fill="#0A0F24" stroke="#4F46E5" stroke-width="8"/>
  <circle cx="250" cy="250" r="210" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  <circle cx="250" cy="250" r="185" fill="#4F46E5" stroke="#FFFFFF" stroke-width="3"/>
  <circle cx="250" cy="250" r="175" fill="#FFFFFF"/>
  <path d="M 250 85 C 310 85, 340 100, 360 160 C 360 270, 250 340, 250 380 C 250 340, 140 270, 140 160 C 160 100, 190 85, 250 85 Z" fill="#D92626" stroke="#000" stroke-width="1.5"/>
  <path d="M 250 85 C 290 85, 320 95, 335 140 C 335 240, 250 320, 250 380 Z" fill="#FFFFFF"/>
  <g transform="translate(165, 120) scale(0.12)">
    <path d="M128 32 C120 40 100 80 100 120 C100 160 130 180 140 200 C150 220 128 256 128 256 C128 256 106 220 116 200 C126 180 156 160 156 120 C156 80 136 40 128 32 Z" fill="#FF8C00"/>
    <rect x="110" y="240" width="36" height="120" fill="#D3D3D3" rx="10"/>
    <rect x="100" y="220" width="56" height="20" fill="#8B0000" rx="5"/>
  </g>
  <g transform="translate(265, 130) scale(0.11)">
    <path d="M20 20 L120 20 L120 180 L20 180 Z" fill="#D92626" stroke="#000" stroke-width="4"/>
    <path d="M120 20 L220 20 L220 180 L120 180 Z" fill="#FFFFFF" stroke="#000" stroke-width="4"/>
    <line x1="40" y1="50" x2="100" y2="50" stroke="#000" stroke-width="6"/>
    <line x1="40" y1="90" x2="100" y2="90" stroke="#000" stroke-width="6"/>
    <line x1="40" y1="130" x2="100" y2="130" stroke="#000" stroke-width="6"/>
    <line x1="140" y1="50" x2="200" y2="50" stroke="#D92626" stroke-width="6"/>
    <line x1="140" y1="90" x2="200" y2="90" stroke="#D92626" stroke-width="6"/>
    <line x1="140" y1="130" x2="200" y2="130" stroke="#D92626" stroke-width="6"/>
  </g>
  <g transform="translate(155, 240) scale(0.13)">
    <polygon points="128,40 230,90 128,140 26,90" fill="#333333"/>
    <rect x="70" y="110" width="116" height="40" fill="#333333"/>
    <path d="M220 90 L220 190 C220 200 210 210 200 210" fill="none" stroke="#D92626" stroke-width="6"/>
    <circle cx="200" cy="210" r="10" fill="#D92626"/>
  </g>
  <g transform="translate(270, 240) scale(0.13)">
    <rect x="110" y="30" width="36" height="180" fill="#D92626" rx="5"/>
    <rect x="50" y="80" width="156" height="36" fill="#D92626" rx="5"/>
  </g>
  <path id="textPathUpper" d="M 50 250 A 200 200 0 1 1 450 250" fill="none"/>
  <path id="textPathLower" d="M 450 250 A 200 200 0 1 1 50 250" fill="none"/>
  <text font-family="'Inter', sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="4">
    <textPath href="#textPathUpper" startOffset="50%" text-anchor="middle">AMALA HIGHER SECONDARY SCHOOL</textPath>
  </text>
  <text font-family="'Inter', sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="3">
    <textPath href="#textPathLower" startOffset="50%" text-anchor="middle">BE A CREATIVE LEARNER</textPath>
  </text>
  <text x="250" y="75" font-family="'Inter', sans-serif" font-size="16" font-weight="800" fill="#0A0F24" text-anchor="middle">PRAISE THE LORD</text>
  <text x="250" y="415" font-family="'Inter', sans-serif" font-size="16" font-weight="800" fill="#0A0F24" text-anchor="middle">SINCE 1977</text>
  <path d="M 80 230 L 105 240 L 80 250 Z" fill="#FFF"/>
  <path d="M 80 260 L 105 270 L 80 280 Z" fill="#FFF"/>
  <path d="M 420 230 L 395 240 L 420 250 Z" fill="#FFF"/>
  <path d="M 420 260 L 395 270 L 420 280 Z" fill="#FFF"/>
</svg>
`;

writeFile('logo.svg', logoSvg);

// 6. LOGIN PAGE (index.html)
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - EduSphere LMS (Amala Higher Secondary School)</title>
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/login.css">
</head>
<body>
  <div class="login-container">
    <!-- Left panel (branding) -->
    <div class="login-left">
      <div class="login-left-brand">
        <div class="login-logo">
          <!-- Embed SVG Logo -->
          <svg viewBox="0 0 500 500" style="width:100%; height:100%;">
            <circle cx="250" cy="250" r="230" fill="#0A0F24"/>
            <circle cx="250" cy="250" r="175" fill="#4F46E5"/>
            <path d="M 250 85 C 310 85, 340 100, 360 160 C 360 270, 250 340, 250 380 C 250 340, 140 270, 140 160 C 160 100, 190 85, 250 85 Z" fill="#D92626"/>
            <text x="250" y="260" fill="#FFF" font-size="70" font-weight="900" text-anchor="middle">AMALA</text>
            <text x="250" y="310" fill="#FFF" font-size="20" font-weight="600" text-anchor="middle">ESTD 1977</text>
          </svg>
        </div>
        <div class="login-left-title">
          AMALA HSS
          <span>EduSphere LMS</span>
        </div>
      </div>
      
      <div class="login-hero">
        <h1>Welcome to EduSphere Portal</h1>
        <p>A unified cloud platform for parents, students, teachers, and administration. Fully integrated with school operations, schedules, academic assessments, and AI tools.</p>
        
        <div class="stats-mini-grid">
          <div class="stat-mini-card">
            <div class="stat-mini-val">2,547</div>
            <div class="stat-mini-lbl">Students</div>
          </div>
          <div class="stat-mini-card">
            <div class="stat-mini-val">148</div>
            <div class="stat-mini-lbl">Teachers</div>
          </div>
          <div class="stat-mini-card">
            <div class="stat-mini-val">LKG-12</div>
            <div class="stat-mini-lbl">Classes</div>
          </div>
        </div>
      </div>
      
      <div>
        <p style="font-size: 12px; color: #E0E7FF;">© 2026 Amala Higher Secondary School. All rights reserved.</p>
      </div>
    </div>
    
    <!-- Right panel (form) -->
    <div class="login-right">
      <div class="login-card">
        <h2 class="login-title">Sign In</h2>
        <p class="login-subtitle">Choose your workspace and enter details below</p>
        
        <div class="role-tabs">
          <div class="role-tab active" data-role="admin">Admin 🛡️</div>
          <div class="role-tab" data-role="teacher">Teacher 👨‍🏫</div>
          <div class="role-tab" data-role="student">Student 🎓</div>
          <div class="role-tab" data-role="parent">Parent 👪</div>
        </div>
        
        <form id="loginForm">
          <div class="form-group">
            <label class="form-label" for="email">User ID / Email</label>
            <input type="text" id="email" class="form-control" placeholder="Enter User ID" required>
          </div>
          
          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label class="form-label" for="password" style="margin-bottom: 0;">Password</label>
              <a href="#" style="font-size: 12px; color: var(--primary); text-decoration: none;">Forgot Password?</a>
            </div>
            <div style="position: relative;">
              <input type="password" id="password" class="form-control" placeholder="••••••••" required>
              <button type="button" id="togglePass" style="position: absolute; right: 12px; top: 10px; background: none; border: none; cursor: pointer; color: var(--gray-500);">👁️</button>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <input type="checkbox" id="remember" style="cursor: pointer;">
            <label for="remember" style="font-size: 13px; cursor: pointer; user-select: none;">Remember Me</label>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px;">Login</button>
        </form>
        
        <div class="demo-credentials">
          <div class="demo-title">Demo Quick Fill</div>
          <div id="demo-list"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="loading-overlay" id="loader">
    <div style="text-align: center;">
      <div class="spinner"></div>
      <p style="margin-top: 15px; font-weight: 600; color: var(--text-main);">Authenticating...</p>
    </div>
  </div>

  <script src="js/login.js"></script>
</body>
</html>
`;

writeFile('index.html', indexHtml);

// 7. LAYOUT UTILITY FOR PROGRAMMATIC PAGE CREATION
function getPortalLayout(role, activeMenu, title, bodyContent) {
  const roleName = role.toUpperCase();
  const userName = role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Mr. Rajesh Kumar' : role === 'student' ? 'Aditya Patel' : 'Suresh Patel';
  
  // Custom sidebar menus
  let menuHtml = '';
  if (role === 'admin') {
    menuHtml = `
      <li class="menu-header">Main</li>
      <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
      <li class="sidebar-item"><a href="students.html">🎓 Students</a></li>
      <li class="sidebar-item"><a href="teachers.html">👨‍🏫 Teachers</a></li>
      <li class="sidebar-item"><a href="parents.html">👪 Parents</a></li>
      <li class="menu-header">Academics</li>
      <li class="sidebar-item"><a href="classes.html">🏫 Classes & Sections</a></li>
      <li class="sidebar-item"><a href="subjects.html">📚 Subjects</a></li>
      <li class="sidebar-item"><a href="timetable.html">📅 Timetable</a></li>
      <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
      <li class="menu-header">Assessment</li>
      <li class="sidebar-item"><a href="exams.html">✍️ Exams</a></li>
      <li class="sidebar-item"><a href="assignments.html">📎 Assignments</a></li>
      <li class="sidebar-item"><a href="results.html">🏆 Results</a></li>
      <li class="menu-header">Administration</li>
      <li class="sidebar-item"><a href="fees.html">💳 Fee Management</a></li>
      <li class="sidebar-item"><a href="library.html">📖 Library</a></li>
      <li class="sidebar-item"><a href="transport.html">🚌 Transport</a></li>
      <li class="sidebar-item"><a href="notifications.html">🔔 Notifications</a></li>
      <li class="menu-header">System</li>
      <li class="sidebar-item"><a href="analytics.html">📈 Analytics</a></li>
      <li class="sidebar-item"><a href="ai-tools.html">🤖 AI Tools</a></li>
      <li class="sidebar-item"><a href="settings.html">⚙️ Settings</a></li>
    `;
  } else if (role === 'teacher') {
    menuHtml = `
      <li class="menu-header">Teacher</li>
      <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
      <li class="sidebar-item"><a href="my-classes.html">🏫 My Classes</a></li>
      <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
      <li class="sidebar-item"><a href="assignments.html">📎 Assignments</a></li>
      <li class="sidebar-item"><a href="study-materials.html">📚 Study Materials</a></li>
      <li class="sidebar-item"><a href="exams.html">✍️ Exams & Marks</a></li>
      <li class="sidebar-item"><a href="messages.html">💬 Messages</a></li>
      <li class="sidebar-item"><a href="profile.html">👤 Profile</a></li>
    `;
  } else if (role === 'student') {
    menuHtml = `
      <li class="menu-header">Student</li>
      <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
      <li class="sidebar-item"><a href="subjects.html">📚 My Subjects</a></li>
      <li class="sidebar-item"><a href="study-materials.html">📖 Study Materials</a></li>
      <li class="sidebar-item"><a href="assignments.html">📎 Assignments</a></li>
      <li class="sidebar-item"><a href="online-tests.html">✍️ Online Tests</a></li>
      <li class="sidebar-item"><a href="timetable.html">📅 Timetable</a></li>
      <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
      <li class="sidebar-item"><a href="results.html">🏆 Results</a></li>
      <li class="sidebar-item"><a href="report-card.html">📄 Report Card</a></li>
      <li class="sidebar-item"><a href="ai-assistant.html">🤖 AI Study Assistant</a></li>
      <li class="sidebar-item"><a href="chat.html">💬 Chat</a></li>
      <li class="sidebar-item"><a href="profile.html">👤 Profile</a></li>
    `;
  } else if (role === 'parent') {
    menuHtml = `
      <li class="menu-header">Parent</li>
      <li class="sidebar-item"><a href="dashboard.html">📊 Dashboard</a></li>
      <li class="sidebar-item"><a href="attendance.html">📝 Attendance</a></li>
      <li class="sidebar-item"><a href="results.html">🏆 Results</a></li>
      <li class="sidebar-item"><a href="homework.html">📎 Homework</a></li>
      <li class="sidebar-item"><a href="fees.html">💳 Fee Details</a></li>
      <li class="sidebar-item"><a href="messages.html">💬 Messages</a></li>
      <li class="sidebar-item"><a href="profile.html">👤 Profile</a></li>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Amala HSS EduSphere</title>
  <link rel="stylesheet" href="../../css/main.css">
  <style>
    :root {
      --primary: ${role === 'admin' ? '#4F46E5' : role === 'teacher' ? '#10B981' : role === 'student' ? '#6366F1' : '#0D9488'};
      --primary-dark: ${role === 'admin' ? '#3730A3' : role === 'teacher' ? '#059669' : role === 'student' ? '#4F46E5' : '#0F766E'};
      --primary-light: ${role === 'admin' ? '#EEF2FF' : role === 'teacher' ? '#ECFDF5' : role === 'student' ? '#EEF2FF' : '#F0FDFA'};
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <svg viewBox="0 0 500 500" class="sidebar-logo" fill="none">
          <circle cx="250" cy="250" r="230" fill="#FFF"/>
          <circle cx="250" cy="250" r="180" fill="#4F46E5"/>
          <text x="250" y="290" fill="#FFF" font-size="120" font-weight="900" text-anchor="middle">A</text>
        </svg>
        <div class="sidebar-title">
          AMALA HSS
          <span>EduSphere LMS</span>
        </div>
      </div>
      <ul class="sidebar-menu">
        ${menuHtml}
        <li style="margin-top: 20px;" class="sidebar-item">
          <a href="#" onclick="App.logout()">🚪 Logout</a>
        </li>
      </ul>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h1 class="page-title">${title}</h1>
        </div>
        <div class="header-right">
          <div class="search-bar">
            🔍 <input type="text" placeholder="Search anything...">
          </div>
          <button class="header-btn" id="darkModeToggle" onclick="App.toggleDark()">🌙</button>
          <button class="header-btn">
            🔔 <span class="badge-dot"></span>
          </button>
          <div class="user-chip">
            <div class="avatar-circle">${userName.split(' ').map(x=>x[0]).join('')}</div>
            <div style="font-weight: 600;">${userName}</div>
          </div>
        </div>
      </header>

      <div class="content-area">
        ${bodyContent}
      </div>
    </main>
  </div>

  <script src="../../js/app.js"></script>
  <script>
    // Local script code injected per page
  </script>
</body>
</html>`;
}

// 8. GENERATING PORTAL PAGES
console.log('Generating Admin Pages...');

// ADMIN - DASHBOARD
writeFile('pages/admin/dashboard.html', getPortalLayout('admin', 'Dashboard', 'Admin Dashboard', `
  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--info)">
      <div class="stat-info">
        <h3>Total Students</h3>
        <div class="stat-value">2,547</div>
      </div>
      <div class="stat-icon">🎓</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--success)">
      <div class="stat-info">
        <h3>Teachers</h3>
        <div class="stat-value">148</div>
      </div>
      <div class="stat-icon">👨‍🏫</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--warning)">
      <div class="stat-info">
        <h3>Avg Attendance</h3>
        <div class="stat-value">91.4%</div>
      </div>
      <div class="stat-icon">📝</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--danger)">
      <div class="stat-info">
        <h3>Fee Collected</h3>
        <div class="stat-value">₹12.4L</div>
      </div>
      <div class="stat-icon">₹</div>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--secondary)">
      <div class="stat-info">
        <h3>Exams Scheduled</h3>
        <div class="stat-value">3</div>
      </div>
      <div class="stat-icon">✍️</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--info)">
      <div class="stat-info">
        <h3>Assignments Due</h3>
        <div class="stat-value">247</div>
      </div>
      <div class="stat-icon">📎</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--success)">
      <div class="stat-info">
        <h3>Library Books</h3>
        <div class="stat-value">1,840</div>
      </div>
      <div class="stat-icon">📖</div>
    </div>
    <div class="stat-card" style="border-left-color: var(--warning)">
      <div class="stat-info">
        <h3>Bus Routes</h3>
        <div class="stat-value">18</div>
      </div>
      <div class="stat-icon">🚌</div>
    </div>
  </div>

  <div class="card">
    <h3 class="card-title">Quick Actions</h3>
    <div class="actions-grid">
      <button class="btn btn-outline" onclick="App.openModal('noticeModal')">📣 Send Notice</button>
      <button class="btn btn-outline" onclick="alert('Starting Database Backup...')">💾 Database Backup</button>
      <button class="btn btn-primary" onclick="window.location.href='students.html'">➕ Add Student</button>
      <button class="btn btn-success" onclick="window.location.href='teachers.html'">➕ Add Teacher</button>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Attendance Monthly Trend</h3>
      <canvas id="attendanceChart" width="500" height="250" style="width:100%; height:250px;"></canvas>
    </div>
    <div class="card">
      <h3 class="card-title">Fee Collection (Last 6 Months)</h3>
      <canvas id="feeChart" width="400" height="250" style="width:100%; height:250px;"></canvas>
    </div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Recent Activity Log</h3>
      <ul style="list-style:none;">
        <li style="padding:10px 0; border-bottom:1px solid var(--border-color)">🕒 <b>14:15</b> - Attendance marked for 10-A by Mr. Rajesh</li>
        <li style="padding:10px 0; border-bottom:1px solid var(--border-color)">🕒 <b>13:00</b> - Student "Karan Shah" admitted to UKG</li>
        <li style="padding:10px 0; border-bottom:1px solid var(--border-color)">🕒 <b>11:30</b> - Quarterly results published for Class 12 Science</li>
        <li style="padding:10px 0; border-bottom:1px solid var(--border-color)">🕒 <b>10:00</b> - Notification sent to parents: Holiday on 18th June</li>
        <li style="padding:10px 0">🕒 <b>09:00</b> - Fee receipt generated for Aditya Patel</li>
      </ul>
    </div>
    <div class="card">
      <h3 class="card-title">Classes Overview</h3>
      <div style="max-height: 250px; overflow-y:auto;">
        <table class="data-table">
          <thead>
            <tr><th>Class</th><th>Sections</th><th>Students</th></tr>
          </thead>
          <tbody>
            <tr><td>LKG</td><td>A, B</td><td>68</td></tr>
            <tr><td>UKG</td><td>A, B, C</td><td>95</td></tr>
            <tr><td>10th Std</td><td>A, B, C, D</td><td>152</td></tr>
            <tr><td>12th Science</td><td>A, B</td><td>82</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Send Notification Modal -->
  <div class="modal-overlay" id="noticeModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Broadcast Notification</h3>
        <button class="modal-close" onclick="App.closeModal('noticeModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Recipients</label>
          <select class="form-control">
            <option>All Students & Parents</option>
            <option>Teachers Only</option>
            <option>Class 10 Only</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Notification Channels</label>
          <div style="display:flex; gap:15px; margin-top:8px;">
            <label><input type="checkbox" checked> App Notice</label>
            <label><input type="checkbox"> Email</label>
            <label><input type="checkbox"> SMS</label>
            <label><input type="checkbox"> WhatsApp</label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea class="form-control" rows="4" placeholder="Write message here..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('noticeModal')">Cancel</button>
        <button class="btn btn-primary" onclick="App.closeModal('noticeModal'); App.showToast('Broadcasted successfully!')">Send Notification</button>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      drawBarChart('feeChart', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], [8.2, 9.5, 11.2, 10.4, 9.8, 12.4], 'var(--danger)');
      drawLineChart('attendanceChart', ['01 Jun', '03 Jun', '05 Jun', '07 Jun', '09 Jun', '11 Jun', '13 Jun'], [92, 91, 93, 89, 94, 91, 95], 'var(--info)');
    });
  </script>
`));

// ADMIN - STUDENTS
writeFile('pages/admin/students.html', getPortalLayout('admin', 'Students', 'Student Management', `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <h3 class="card-title" style="margin-bottom:0;">Student Catalog</h3>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-outline" onclick="alert('Import CSV feature: Drag files here')">📤 Import CSV</button>
        <button class="btn btn-primary" onclick="App.openModal('addStudentModal')">➕ Add Student</button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div style="display:grid; grid-template-columns: 2fr 2fr 4fr; gap:15px; margin-bottom:20px;">
      <select class="form-control" id="classFilter">
        <option>All Classes</option>
        <option>LKG</option>
        <option>Class 10</option>
        <option>Class 12 Science</option>
      </select>
      <select class="form-control">
        <option>All Sections</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
      </select>
      <input type="text" class="form-control" placeholder="Search by name, roll no, or admission no...">
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Admission No</th>
            <th>Name</th>
            <th>Class</th>
            <th>Parent Name</th>
            <th>Phone</th>
            <th>Attendance</th>
            <th>Fee Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ADM2026001</td>
            <td>Aditya Patel</td>
            <td>10-A</td>
            <td>Suresh Patel</td>
            <td>+91 9876543210</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="progress-bar-container" style="width: 80px;"><div class="progress-bar" style="width: 92%; background-color: var(--success);"></div></div>
                92%
              </div>
            </td>
            <td><span class="badge badge-success">Paid</span></td>
            <td>
              <button class="btn btn-outline" style="padding:4px 8px;" onclick="alert('Viewing profile of Aditya Patel')">👁️</button>
              <button class="btn btn-outline" style="padding:4px 8px; color:var(--danger);" onclick="confirm('Are you sure you want to delete this student?')">🗑️</button>
            </td>
          </tr>
          <tr>
            <td>ADM2026002</td>
            <td>Pooja Sharma</td>
            <td>12-B</td>
            <td>Ramesh Sharma</td>
            <td>+91 8765432109</td>
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="progress-bar-container" style="width: 80px;"><div class="progress-bar" style="width: 68%; background-color: var(--danger);"></div></div>
                68%
              </div>
            </td>
            <td><span class="badge badge-warning">Partial</span></td>
            <td>
              <button class="btn btn-outline" style="padding:4px 8px;" onclick="alert('Viewing profile of Pooja')">👁️</button>
              <button class="btn btn-outline" style="padding:4px 8px; color:var(--danger);" onclick="confirm('Are you sure?')">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add Student Modal -->
  <div class="modal-overlay" id="addStudentModal">
    <div class="modal" style="max-width:800px;">
      <div class="modal-header">
        <h3 class="modal-title">New Student Admission</h3>
        <button class="modal-close" onclick="App.closeModal('addStudentModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="tab-container">
          <div class="tab active" onclick="switchModalTab(0)">Personal Info</div>
          <div class="tab" onclick="switchModalTab(1)">Academic Details</div>
          <div class="tab" onclick="switchModalTab(2)">Parent / Guardian</div>
          <div class="tab" onclick="switchModalTab(3)">Transport & Hostels</div>
        </div>

        <div class="modal-tab-content">
          <!-- Personal -->
          <div class="modal-pane">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
              <div class="form-group"><label class="form-label">First Name</label><input type="text" class="form-control"></div>
              <div class="form-group"><label class="form-label">Last Name</label><input type="text" class="form-control"></div>
              <div class="form-group"><label class="form-label">DOB</label><input type="date" class="form-control"></div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <select class="form-control"><option>Male</option><option>Female</option><option>Other</option></select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('addStudentModal')">Cancel</button>
        <button class="btn btn-primary" onclick="App.closeModal('addStudentModal'); App.showToast('Student admitted successfully!')">Save Student</button>
      </div>
    </div>
  </div>

  <script>
    function switchModalTab(index) {
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach((t, i) => {
        if(i === index) t.classList.add('active');
        else t.classList.remove('active');
      });
      App.showToast('Switched to section ' + (index+1));
    }
  </script>
`));

// ADMIN - TEACHERS
writeFile('pages/admin/teachers.html', getPortalLayout('admin', 'Teachers', 'Teacher Directory', `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <h3 class="card-title" style="margin-bottom:0;">Assigned Academic Staff</h3>
      <button class="btn btn-primary" onclick="App.openModal('addTeacherModal')">➕ Add Teacher</button>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr><th>ID</th><th>Photo</th><th>Name</th><th>Department</th><th>Subjects</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>TCH001</td>
            <td><div class="avatar-circle" style="width:30px; height:30px; font-size:11px;">RK</div></td>
            <td>Rajesh Kumar</td>
            <td>Mathematics</td>
            <td>Algebra, Geometry</td>
            <td>+91 9441234567</td>
            <td><span class="badge badge-success">Full-Time</span></td>
            <td>
              <button class="btn btn-outline" style="padding:4px 8px;">Edit</button>
            </td>
          </tr>
          <tr>
            <td>TCH002</td>
            <td><div class="avatar-circle" style="width:30px; height:30px; font-size:11px; background-color:var(--success);">PS</div></td>
            <td>Priya Sharma</td>
            <td>Science</td>
            <td>Physics, Chemistry</td>
            <td>+91 9441112223</td>
            <td><span class="badge badge-success">Full-Time</span></td>
            <td>
              <button class="btn btn-outline" style="padding:4px 8px;">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add Teacher Modal -->
  <div class="modal-overlay" id="addTeacherModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Register New Faculty</h3>
        <button class="modal-close" onclick="App.closeModal('addTeacherModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control"></div>
        <div class="form-group"><label class="form-label">Department</label><input type="text" class="form-control"></div>
        <div class="form-group"><label class="form-label">Assigned Classes (e.g. 10th A, 12th B)</label><input type="text" class="form-control"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('addTeacherModal')">Cancel</button>
        <button class="btn btn-primary" onclick="App.closeModal('addTeacherModal'); App.showToast('Teacher registered!')">Save</button>
      </div>
    </div>
  </div>
`));

// ADMIN - PARENTS
writeFile('pages/admin/parents.html', getPortalLayout('admin', 'Parents', 'Parent & Guardian Directory', `
  <div class="card">
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr><th>Father's Name</th><th>Mother's Name</th><th>Phone</th><th>Email</th><th>Associated Child</th><th>Occupation</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Suresh Patel</td>
            <td>Rita Patel</td>
            <td>+91 9876543210</td>
            <td>suresh@example.com</td>
            <td>Aditya Patel (10-A)</td>
            <td>Business Manager</td>
          </tr>
          <tr>
            <td>Ramesh Sharma</td>
            <td>Meena Sharma</td>
            <td>+91 8765432109</td>
            <td>ramesh@example.com</td>
            <td>Pooja Sharma (12-B)</td>
            <td>Software Engineer</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
`));

// ADMIN - CLASSES & SECTIONS
writeFile('pages/admin/classes.html', getPortalLayout('admin', 'Classes & Sections', 'School Structure', `
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
    <h3>Grade Configurations</h3>
    <button class="btn btn-primary" onclick="alert('Add Class configuration')">➕ New Class</button>
  </div>

  <div class="grid-3">
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size:16px;">LKG</h4>
        <span class="badge badge-purple">Pre-Primary</span>
      </div>
      <p><b>Sections:</b> A, B</p>
      <p><b>Total Students:</b> 68</p>
      <p><b>Head Teacher:</b> Mrs. Mary L.</p>
      <div style="margin-top:15px; display:flex; gap:10px;">
        <button class="btn btn-outline" style="padding:4px 8px; flex:1;">Edit</button>
        <button class="btn btn-primary" style="padding:4px 8px; flex:1;">Manage</button>
      </div>
    </div>
    
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size:16px;">Class 10</h4>
        <span class="badge badge-info">Secondary</span>
      </div>
      <p><b>Sections:</b> A, B, C, D</p>
      <p><b>Total Students:</b> 152</p>
      <p><b>Head Teacher:</b> Mr. Rajesh Kumar</p>
      <div style="margin-top:15px; display:flex; gap:10px;">
        <button class="btn btn-outline" style="padding:4px 8px; flex:1;">Edit</button>
        <button class="btn btn-primary" style="padding:4px 8px; flex:1;">Manage</button>
      </div>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-size:16px;">Class 12 Science</h4>
        <span class="badge badge-danger">HSC</span>
      </div>
      <p><b>Sections:</b> A, B</p>
      <p><b>Total Students:</b> 82</p>
      <p><b>Head Teacher:</b> Mrs. Priya Sharma</p>
      <div style="margin-top:15px; display:flex; gap:10px;">
        <button class="btn btn-outline" style="padding:4px 8px; flex:1;">Edit</button>
        <button class="btn btn-primary" style="padding:4px 8px; flex:1;">Manage</button>
      </div>
    </div>
  </div>
`));

// ADMIN - SUBJECTS
writeFile('pages/admin/subjects.html', getPortalLayout('admin', 'Subjects', 'Subject Management', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Subject Registry</h3>
      <table class="data-table">
        <thead>
          <tr><th>Code</th><th>Name</th><th>Class</th><th>Weekly Periods</th><th>Type</th></tr>
        </thead>
        <tbody>
          <tr><td>MAT101</td><td>Mathematics</td><td>Class 10</td><td>6</td><td>Core</td></tr>
          <tr><td>PHY121</td><td>Physics</td><td>Class 12 Science</td><td>5</td><td>Core</td></tr>
          <tr><td>ENG102</td><td>English Language</td><td>Class 10</td><td>4</td><td>Language</td></tr>
        </tbody>
      </table>
    </div>
    
    <div class="card">
      <h3 class="card-title">Add New Subject</h3>
      <form onsubmit="event.preventDefault(); App.showToast('Subject registered successfully!');">
        <div class="form-group"><label class="form-label">Subject Code</label><input type="text" class="form-control" required></div>
        <div class="form-group"><label class="form-label">Subject Name</label><input type="text" class="form-control" required></div>
        <div class="form-group">
          <label class="form-label">Target Class</label>
          <select class="form-control"><option>Class 10</option><option>Class 12 Science</option></select>
        </div>
        <div class="form-group"><label class="form-label">Periods per Week</label><input type="number" class="form-control" value="5"></div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Register Subject</button>
      </form>
    </div>
  </div>
`));

// ADMIN - TIMETABLE
writeFile('pages/admin/timetable.html', getPortalLayout('admin', 'Timetable', 'Timetable Editor', `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <div>
        <select class="form-control" style="display:inline-block; width:150px; margin-right:10px;">
          <option>Class 10-A</option>
          <option>Class 12-A</option>
        </select>
        <button class="btn btn-outline">Apply Filters</button>
      </div>
      <div style="display:flex; gap:10px;">
        <button class="btn btn-warning" onclick="alert('Running AI generation algorithms for CBSE standards...')">🤖 Generate Timetable (AI)</button>
        <button class="btn btn-primary" onclick="window.print()">Print PDF</button>
      </div>
    </div>

    <table class="data-table" style="text-align:center;">
      <thead>
        <tr>
          <th>Time Slot</th>
          <th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>08:00 - 08:45</b></td>
          <td style="background-color:var(--primary-light);">Math<br><small>Rajesh K.</small></td>
          <td>Physics<br><small>Priya S.</small></td>
          <td style="background-color:var(--primary-light);">Math<br><small>Rajesh K.</small></td>
          <td>Chemistry<br><small>Alok D.</small></td>
          <td>English<br><small>Sumita M.</small></td>
          <td>Lib Period</td>
        </tr>
        <tr>
          <td><b>08:45 - 09:30</b></td>
          <td>English<br><small>Sumita M.</small></td>
          <td style="background-color:var(--primary-light);">Math<br><small>Rajesh K.</small></td>
          <td>Chemistry<br><small>Alok D.</small></td>
          <td>English<br><small>Sumita M.</small></td>
          <td>Physics<br><small>Priya S.</small></td>
          <td>Sports</td>
        </tr>
        <!-- Lunch Break -->
        <tr style="background-color:var(--gray-100);">
          <td colspan="7"><b>Lunch Break (12:00 - 12:45)</b></td>
        </tr>
        <tr>
          <td><b>12:45 - 01:30</b></td>
          <td>Biology<br><small>Anita V.</small></td>
          <td>Social Sc.<br><small>Pavan G.</small></td>
          <td>Biology<br><small>Anita V.</small></td>
          <td>Social Sc.<br><small>Pavan G.</small></td>
          <td>Lab Session</td>
          <td>Lab Session</td>
        </tr>
      </tbody>
    </table>
  </div>
`));

// ADMIN - ATTENDANCE
writeFile('pages/admin/attendance.html', getPortalLayout('admin', 'Attendance', 'Attendance Tracker', `
  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Present Today</h3><div class="stat-value">2,382</div></div></div>
    <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Absent Today</h3><div class="stat-value">165</div></div></div>
    <div class="stat-card" style="border-left-color: var(--warning)"><div class="stat-info"><h3>Late Arrivals</h3><div class="stat-value">42</div></div></div>
    <div class="stat-card" style="border-left-color: var(--info)"><div class="stat-info"><h3>Overall rate</h3><div class="stat-value">93.4%</div></div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Mark attendance sheet</h3>
      <table class="data-table">
        <thead>
          <tr><th>Roll No</th><th>Student Name</th><th>Class</th><th>Status</th><th>Arrival</th><th>Remarks</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Aditya Patel</td>
            <td>10-A</td>
            <td>
              <select class="form-control" style="width:100px;">
                <option selected>Present</option>
                <option>Absent</option>
                <option>Late</option>
              </select>
            </td>
            <td>08:02 AM</td>
            <td><input type="text" class="form-control" value="On Time"></td>
          </tr>
          <tr>
            <td>2</td>
            <td>Arun Das</td>
            <td>10-A</td>
            <td>
              <select class="form-control">
                <option>Present</option>
                <option selected>Absent</option>
                <option>Late</option>
              </select>
            </td>
            <td>--</td>
            <td><input type="text" class="form-control" value="Fever alert"></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:15px; text-align:right;">
        <button class="btn btn-warning" onclick="alert('Sending warning alerts to parent portals...')">📢 Send Absentee Alerts</button>
        <button class="btn btn-primary" onclick="App.showToast('Attendance records updated!')">Save Attendance</button>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">Chronic Absentees (Below 75%)</h3>
      <table class="data-table">
        <thead>
          <tr><th>Student</th><th>Class</th><th>Rate</th></tr>
        </thead>
        <tbody>
          <tr><td>Vikram Naik</td><td>11-Science</td><td style="color:var(--danger); font-weight:700;">62%</td></tr>
          <tr><td>Sneha Das</td><td>10-B</td><td style="color:var(--danger); font-weight:700;">71%</td></tr>
        </tbody>
      </table>
    </div>
  </div>
`));

// ADMIN - EXAMS
writeFile('pages/admin/exams.html', getPortalLayout('admin', 'Examinations', 'Exams Scheduler', `
  <div class="tab-container">
    <div class="tab active">Upcoming Exams</div>
    <div class="tab">Ongoing Sessions</div>
    <div class="tab">Completed Reports</div>
    <div class="tab">Online Exams Console</div>
  </div>

  <div style="text-align:right; margin-bottom:15px;">
    <button class="btn btn-outline" onclick="App.openModal('questionModal')">🤖 Generate Question Bank</button>
    <button class="btn btn-primary" onclick="App.openModal('examModal')">➕ Schedule Exam</button>
  </div>

  <div class="card">
    <table class="data-table">
      <thead>
        <tr><th>Exam Name</th><th>Type</th><th>Classes</th><th>Date Range</th><th>Max Marks</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Quarterly Examination</td>
          <td>Quarterly</td>
          <td>Class 8 - 12</td>
          <td>18 Jun - 25 Jun 2026</td>
          <td>100</td>
          <td><span class="badge badge-success">Scheduled</span></td>
        </tr>
        <tr>
          <td>Unit Test 2</td>
          <td>Unit Test</td>
          <td>Class LKG - 12</td>
          <td>02 Jul - 05 Jul 2026</td>
          <td>25</td>
          <td><span class="badge badge-purple">Draft</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Schedule Exam Modal -->
  <div class="modal-overlay" id="examModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Schedule Academic Exam</h3>
        <button class="modal-close" onclick="App.closeModal('examModal')">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Exam Name</label><input type="text" class="form-control"></div>
        <div class="form-group"><label class="form-label">Subject Category</label><select class="form-control"><option>Mathematics</option><option>Physics</option></select></div>
        <div class="form-group"><label class="form-label">Duration (Minutes)</label><input type="number" class="form-control" value="180"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="App.closeModal('examModal')">Cancel</button>
        <button class="btn btn-primary" onclick="App.closeModal('examModal'); App.showToast('Exam scheduled!')">Schedule</button>
      </div>
    </div>
  </div>

  <!-- AI Question Bank Modal -->
  <div class="modal-overlay" id="questionModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">AI Question Paper Builder</h3>
        <button class="modal-close" onclick="App.closeModal('questionModal')">×</button>
      </div>
      <div class="modal-body">
        <p>This links to the AI Tools panel to generate board standard papers. Please select subject details.</p>
        <button class="btn btn-warning" onclick="window.location.href='ai-tools.html'">Go to AI Tools Page</button>
      </div>
    </div>
  </div>
`));

// ADMIN - ASSIGNMENTS
writeFile('pages/admin/assignments.html', getPortalLayout('admin', 'Assignments', 'Assignments Module', `
  <div class="card">
    <h3 class="card-title">Manage School Homework & Activities</h3>
    <table class="data-table">
      <thead>
        <tr><th>Topic</th><th>Subject</th><th>Class</th><th>Submissions</th><th>Due Date</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Quadratic Equations Worksheet</td>
          <td>Mathematics</td>
          <td>10-A</td>
          <td>28 / 35</td>
          <td>20 Jun 2026</td>
          <td><button class="btn btn-outline" onclick="alert('Viewing submission sheet')">View Submissions</button></td>
        </tr>
      </tbody>
    </table>
  </div>
`));

// ADMIN - RESULTS
writeFile('pages/admin/results.html', getPortalLayout('admin', 'Results', 'Report Card Center', `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <h3 class="card-title">Subject Performance Records</h3>
      <div>
        <button class="btn btn-outline" onclick="alert('Downloading report cards ZIP bundle...')">📦 Download All Report Cards (ZIP)</button>
      </div>
    </div>

    <table class="data-table">
      <thead>
        <tr><th>Student Name</th><th>Class</th><th>Marks Scored</th><th>Percentage</th><th>Grade</th><th>Pass Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Aditya Patel</td>
          <td>10-A</td>
          <td>465 / 500</td>
          <td>93.0%</td>
          <td>A+</td>
          <td><span class="badge badge-success">Passed</span></td>
          <td><button class="btn btn-primary" onclick="alert('Opening Aditya\\'s printable PDF card...')">📄 Download PDF</button></td>
        </tr>
      </tbody>
    </table>
  </div>
`));

// ADMIN - FEES
writeFile('pages/admin/fees.html', getPortalLayout('admin', 'Fees', 'Financial Accounting Console', `
  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Collected (Month)</h3><div class="stat-value">₹8,45,000</div></div></div>
    <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Pending Amount</h3><div class="stat-value">₹3,95,000</div></div></div>
    <div class="stat-card" style="border-left-color: var(--warning)"><div class="stat-info"><h3>Due Students</h3><div class="stat-value">48</div></div></div>
    <div class="stat-card" style="border-left-color: var(--info)"><div class="stat-info"><h3>Total Receipts</h3><div class="stat-value">312</div></div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Fee Structures</h3>
      <table class="data-table">
        <thead>
          <tr><th>Grade Bracket</th><th>Yearly Tuition Fee</th></tr>
        </thead>
        <tbody>
          <tr><td>LKG / UKG</td><td>₹45,000 / yr</td></tr>
          <tr><td>1st - 5th Std</td><td>₹52,000 / yr</td></tr>
          <tr><td>6th - 8th Std</td><td>₹58,000 / yr</td></tr>
          <tr><td>9th - 10th Std</td><td>₹65,000 / yr</td></tr>
          <tr><td>11th - 12th Std</td><td>₹75,000 / yr</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 class="card-title">Quick Fee Collection</h3>
      <form onsubmit="event.preventDefault(); App.showToast('Payment receipt generated!');">
        <div class="form-group"><label class="form-label">Search Student ID</label><input type="text" class="form-control" placeholder="STU001"></div>
        <div class="form-group">
          <label class="form-label">Term / Fee Type</label>
          <select class="form-control"><option>Term 1 Tuition</option><option>Annual Bus Fee</option></select>
        </div>
        <div class="form-group"><label class="form-label">Amount Paid</label><input type="number" class="form-control" value="25000"></div>
        <button type="submit" class="btn btn-success" style="width:100%;">Collect Payment & Print Receipt</button>
      </form>
    </div>
  </div>
`));

// ADMIN - LIBRARY
writeFile('pages/admin/library.html', getPortalLayout('admin', 'Library', 'School Library Registrar', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Book Catalogue</h3>
      <table class="data-table">
        <thead>
          <tr><th>ISBN</th><th>Title</th><th>Author</th><th>Available</th></tr>
        </thead>
        <tbody>
          <tr><td>978-01-234</td><td>Concepts of Physics</td><td>H.C. Verma</td><td>12 / 15</td></tr>
          <tr><td>978-93-518</td><td>RD Sharma Class 10 Math</td><td>R.D. Sharma</td><td>3 / 10</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 class="card-title">Issue Book Card</h3>
      <form onsubmit="event.preventDefault(); App.showToast('Book issued successfully!');">
        <div class="form-group"><label class="form-label">Student ID</label><input type="text" class="form-control" placeholder="STU001"></div>
        <div class="form-group"><label class="form-label">Book ISBN</label><input type="text" class="form-control" placeholder="978-01-234"></div>
        <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-control"></div>
        <button type="submit" class="btn btn-primary" style="width:100%;">Issue Book</button>
      </form>
    </div>
  </div>
`));

// ADMIN - TRANSPORT
writeFile('pages/admin/transport.html', getPortalLayout('admin', 'Transport', 'School Bus Fleet & Routes', `
  <div class="card">
    <h3 class="card-title">Active Fleet Status</h3>
    <table class="data-table">
      <thead>
        <tr><th>Route No</th><th>Area Coverage</th><th>Stops</th><th>Assigned Driver</th><th>Vehicle ID</th></tr>
      </thead>
      <tbody>
        <tr><td>Route 3</td><td>Gandhi Nagar, Central Sector</td><td>8 Stops</td><td>Hari Das (+91 91234 56789)</td><td>TN-37-AB-1234</td></tr>
        <tr><td>Route 5</td><td>Lakeside Colony, Ring Road</td><td>5 Stops</td><td>Murali M. (+91 92345 67890)</td><td>TN-37-CD-5678</td></tr>
      </tbody>
    </table>
  </div>
`));

// ADMIN - NOTIFICATIONS
writeFile('pages/admin/notifications.html', getPortalLayout('admin', 'Notifications', 'Broadcast Hub', `
  <div class="card">
    <h3 class="card-title">Create School Circular / Announcement</h3>
    <form onsubmit="event.preventDefault(); App.showToast('Notice posted on announcement board!');">
      <div class="form-group"><label class="form-label">Subject / Title</label><input type="text" class="form-control" required></div>
      <div class="form-group">
        <label class="form-label">Target Groups</label>
        <div style="display:flex; gap:15px; margin-top:8px;">
          <label><input type="checkbox" checked> Students</label>
          <label><input type="checkbox" checked> Parents</label>
          <label><input type="checkbox"> Teachers</label>
        </div>
      </div>
      <div class="form-group"><label class="form-label">Notification Body</label><textarea class="form-control" rows="5" placeholder="Type notice detail here..." required></textarea></div>
      <button type="submit" class="btn btn-primary">Publish Circular</button>
    </form>
  </div>
`));

// ADMIN - ANALYTICS
writeFile('pages/admin/analytics.html', getPortalLayout('admin', 'Analytics', 'Academic Performance Analytics', `
  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--primary)"><div class="stat-info"><h3>Avg score</h3><div class="stat-value">78.5%</div></div></div>
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Pass Rate</h3><div class="stat-value">96.2%</div></div></div>
    <div class="stat-card" style="border-left-color: var(--warning)"><div class="stat-info"><h3>Avg Attendance</h3><div class="stat-value">91.4%</div></div></div>
    <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Staff Ratio</h3><div class="stat-value">1:17</div></div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Score Distributions (Bar Chart)</h3>
      <canvas id="scoresChart" width="500" height="250" style="width:100%; height:250px;"></canvas>
    </div>
    <div class="card">
      <h3 class="card-title">Top 5 Academic Performers</h3>
      <table class="data-table">
        <thead>
          <tr><th>Rank</th><th>Student</th><th>Grade</th><th>Percentage</th></tr>
        </thead>
        <tbody>
          <tr><td>🏆 1</td><td>Aditya Patel</td><td>10-A</td><td>98.2%</td></tr>
          <tr><td>🥈 2</td><td>Priya Seth</td><td>12-Science</td><td>97.4%</td></tr>
          <tr><td>🥉 3</td><td>Amit Shah</td><td>9-C</td><td>96.8%</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      drawBarChart('scoresChart', ['Math', 'Science', 'English', 'Social Science', 'Hindi'], [82, 79, 88, 74, 80], 'var(--primary)');
    });
  </script>
`));

// ADMIN - AI TOOLS
writeFile('pages/admin/ai-tools.html', getPortalLayout('admin', 'AI Tools', 'Cognitive School AI Engine', `
  <p style="margin-bottom:20px; color:var(--text-muted);">All tools are integrated with the Anthropic Claude API to generate curriculum-appropriate material.</p>
  
  <div class="grid-3">
    <!-- Tool 1 -->
    <div class="card" style="background:linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-left: 5px solid var(--primary);">
      <h4 style="margin-bottom:10px;">📋 Question Paper Generator</h4>
      <p style="font-size:12px; margin-bottom:15px; color:var(--gray-700);">Create complete board-standard question papers dynamically with Sections A, B, and C.</p>
      <div class="form-group"><label class="form-label">Subject</label><input type="text" class="form-control" id="qpSub" value="Mathematics"></div>
      <div class="form-group"><label class="form-label">Class</label><select class="form-control" id="qpClass"><option>Class 10</option><option>Class 12</option></select></div>
      <button class="btn btn-primary" style="width:100%;" onclick="runQpGenerator()">Generate Paper</button>
    </div>

    <!-- Tool 2 -->
    <div class="card" style="background:linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border-left: 5px solid var(--success);">
      <h4 style="margin-bottom:10px;">🎯 Interactive Quiz Generator</h4>
      <p style="font-size:12px; margin-bottom:15px; color:var(--gray-700);">Generate curriculum-aligned MCQs with marked answer sheets in seconds.</p>
      <div class="form-group"><label class="form-label">Topic</label><input type="text" class="form-control" id="qzTopic" value="Photosynthesis"></div>
      <button class="btn btn-success" style="width:100%;" onclick="runQuizGenerator()">Generate MCQ Quiz</button>
    </div>

    <!-- Tool 3 -->
    <div class="card" style="background:linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border-left: 5px solid var(--warning);">
      <h4 style="margin-bottom:10px;">🙋 Patient Homework Assistant</h4>
      <p style="font-size:12px; margin-bottom:15px; color:var(--gray-700);">Grade-specific step-by-step concept breakdowns to resolve student queries.</p>
      <div class="form-group"><label class="form-label">Question Text</label><input type="text" class="form-control" id="hwQ" value="How does gravity work?"></div>
      <button class="btn btn-warning" style="width:100%;" onclick="runHwAssistant()">Get Breakdown</button>
    </div>
  </div>

  <div class="grid-3">
    <!-- Tool 4 -->
    <div class="card">
      <h4>🔮 Student Performance Predictor</h4>
      <p style="font-size:12px; margin-bottom:12px;">Analyses quarterly performance and suggests high/low risk indicators.</p>
      <table class="data-table" style="font-size:11px;">
        <thead><tr><th>Student</th><th>Current</th><th>Risk</th></tr></thead>
        <tbody>
          <tr><td>Sneha Das</td><td>64%</td><td><span class="badge badge-danger">High Risk</span></td></tr>
          <tr><td>Amit Shah</td><td>82%</td><td><span class="badge badge-success">Low Risk</span></td></tr>
        </tbody>
      </table>
    </div>

    <!-- Tool 5 -->
    <div class="card" style="grid-column: span 2;">
      <h4>💬 Student Study Bot (EduBot)</h4>
      <div id="chatbox" style="height:150px; overflow-y:auto; border:1px solid var(--border-color); padding:10px; border-radius:var(--radius); background-color:var(--gray-100); margin-bottom:10px; font-size:12px;">
        <p><b>EduBot:</b> Hello! Ask me any doubt about Mathematics, Science, or English.</p>
      </div>
      <div style="display:flex; gap:10px;">
        <input type="text" class="form-control" id="chatInput" placeholder="Ask EduBot a question...">
        <button class="btn btn-primary" onclick="sendToEduBot()">Send</button>
      </div>
    </div>
  </div>

  <!-- Output Modal -->
  <div class="modal-overlay" id="aiOutputModal">
    <div class="modal" style="max-width:700px;">
      <div class="modal-header">
        <h3 class="modal-title" id="aiOutputTitle">AI Output Results</h3>
        <button class="modal-close" onclick="App.closeModal('aiOutputModal')">×</button>
      </div>
      <div class="modal-body">
        <pre id="aiOutputBody" style="white-space: pre-wrap; font-family: 'Courier New', Courier, monospace; background-color: var(--gray-100); padding: 15px; border-radius: var(--radius); font-size: 13px; max-height:400px; overflow-y:auto;"></pre>
      </div>
    </div>
  </div>

  <script>
    async function runQpGenerator() {
      const subject = document.getElementById('qpSub').value;
      const grade = document.getElementById('qpClass').value;
      
      document.getElementById('aiOutputTitle').innerText = 'Generated Question Paper - ' + subject;
      document.getElementById('aiOutputBody').innerText = 'Generating paper using Claude Sonnet model. Please wait...';
      App.openModal('aiOutputModal');
      
      setTimeout(() => {
        document.getElementById('aiOutputBody').innerText = \`AMALA HIGHER SECONDARY SCHOOL
ANNUAL EXAMINATION 2026 - GRADE 10
SUBJECT: \${subject.toUpperCase()}
TIME: 3 Hours                          MAX MARKS: 80

--------------------------------------------------
SECTION A (MULTIPLE CHOICE QUESTIONS - 1 Mark Each)
--------------------------------------------------
Q1. Solve for x: 3x - 7 = 14.
  a) 5       b) 7       c) 6       d) 9
Q2. What is the value of Sin(30) + Cos(60)?
  a) 1       b) 0.5     c) 0       d) 2

--------------------------------------------------
SECTION B (SHORT ANSWER QUESTIONS - 3 Marks Each)
--------------------------------------------------
Q3. Find the roots of the equation x^2 - 5x + 6 = 0.
Q4. Define Pythagoras theorem and write the formula.

--------------------------------------------------
SECTION C (LONG ANSWER/ESSAY QUESTIONS - 5 Marks Each)
--------------------------------------------------
Q5. Prove that the lengths of tangents drawn from an external point to a circle are equal.\`;
        App.showToast('Question Paper generated successfully!');
      }, 1200);
    }

    async function runQuizGenerator() {
      const topic = document.getElementById('qzTopic').value;
      document.getElementById('aiOutputTitle').innerText = 'Generated MCQ Quiz - ' + topic;
      document.getElementById('aiOutputBody').innerText = 'Processing quiz questions...';
      App.openModal('aiOutputModal');
      
      setTimeout(() => {
        document.getElementById('aiOutputBody').innerText = \`TOPIC: \${topic.toUpperCase()} - GRADE LEVEL QUIZ
Total Questions: 3 | Marks: 10

Q1. Which of the following gas is absorbed during photosynthesis?
  a) Carbon Dioxide [Correct]
  b) Oxygen
  c) Nitrogen
  d) Hydrogen

Q2. Where does photosynthesis take place inside plant cells?
  a) Mitochondria
  b) Chloroplast [Correct]
  c) Nucleus
  d) Cell Wall\`;
      }, 1000);
    }

    async function runHwAssistant() {
      const hw = document.getElementById('hwQ').value;
      document.getElementById('aiOutputTitle').innerText = 'AI Homework Explanation';
      document.getElementById('aiOutputBody').innerText = 'Explaining...';
      App.openModal('aiOutputModal');
      
      setTimeout(() => {
        document.getElementById('aiOutputBody').innerText = \`QUESTION: "\${hw}"
EXPLANATION (Appropriate for Class 8-10):

Imagine throwing a ball straight up. It doesn't fly off into space; it drops back to you. Why? Because of an invisible pulling force called Gravity.

Key Points:
1. Everything with mass has gravity.
2. The bigger the object, the stronger the pull (Earth has huge gravity!).
3. Distance matters: the farther apart things are, the weaker the pull.
4. Without gravity, we would all float off into space!\`;
      }, 1000);
    }

    function sendToEduBot() {
      const chatInput = document.getElementById('chatInput');
      const text = chatInput.value.trim();
      if(!text) return;
      
      const chatbox = document.getElementById('chatbox');
      chatbox.innerHTML += \`<p style="margin-top:5px; text-align:right;"><b>You:</b> \${text}</p>\`;
      chatInput.value = '';
      
      setTimeout(() => {
        chatbox.innerHTML += \`<p style="margin-top:5px; color:var(--primary);"><b>EduBot:</b> That is a great question! In simple terms, we study this concept to understand how the universe stays in balance. Let me know if you want a detailed math explanation!</p>\`;
        chatbox.scrollTop = chatbox.scrollHeight;
      }, 800);
    }
  </script>
`));

// ADMIN - SETTINGS
writeFile('pages/admin/settings.html', getPortalLayout('admin', 'Settings', 'System Configuration', `
  <div class="tab-container">
    <div class="tab active">School Details</div>
    <div class="tab">Academic Calendar</div>
    <div class="tab">Roles & Permissions</div>
    <div class="tab">System Options</div>
  </div>

  <div class="card">
    <h3 class="card-title">School Preferences</h3>
    <form onsubmit="event.preventDefault(); App.showToast('Configuration settings updated!');">
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <div class="form-group"><label class="form-label">School Name</label><input type="text" class="form-control" value="AMALA HIGHER SECONDARY SCHOOL"></div>
        <div class="form-group"><label class="form-label">School Code / License</label><input type="text" class="form-control" value="HSS-CBSE-3701"></div>
        <div class="form-group"><label class="form-label">Affiliated Education Board</label><select class="form-control"><option>CBSE Board</option><option>State Board</option><option>ICSE Board</option></select></div>
        <div class="form-group"><label class="form-label">Medium of Instruction</label><input type="text" class="form-control" value="English"></div>
      </div>
      
      <button type="submit" class="btn btn-primary" style="margin-top:15px;">Update General settings</button>
    </form>
  </div>
`));

// 9. GENERATING TEACHER PORTAL PAGES
console.log('Generating Teacher Pages...');

// TEACHER - DASHBOARD
writeFile('pages/teacher/dashboard.html', getPortalLayout('teacher', 'Teacher Dashboard', 'Welcome back, Mr. Rajesh', `
  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>My Classes</h3><div class="stat-value">6 Classes</div></div></div>
    <div class="stat-card" style="border-left-color: var(--info)"><div class="stat-info"><h3>Total Students</h3><div class="stat-value">284</div></div></div>
    <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Assignments Review</h3><div class="stat-value">12 Pending</div></div></div>
    <div class="stat-card" style="border-left-color: var(--warning)"><div class="stat-info"><h3>Classes Today</h3><div class="stat-value">4 Periods</div></div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Today's Teaching Schedule</h3>
      <ul style="list-style:none;">
        <li style="padding:12px; border-bottom:1px solid var(--border-color); background-color:var(--primary-light); border-radius:var(--radius); margin-bottom:10px;">
          ⏱️ <b>08:00 - 08:45 AM</b> | Class 10-A | Subject: Mathematics | Room 101
        </li>
        <li style="padding:12px; border-bottom:1px solid var(--border-color); margin-bottom:10px;">
          ⏱️ <b>08:45 - 09:30 AM</b> | Class 10-B | Subject: Geometry | Room 102
        </li>
        <li style="padding:12px; border-bottom:1px solid var(--border-color); margin-bottom:10px;">
          ⏱️ <b>12:45 - 01:30 PM</b> | Class 12-Science | Subject: Algebra | Lecture Hall 3
        </li>
      </ul>
    </div>

    <div class="card">
      <h3 class="card-title">Quick Tasks</h3>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button class="btn btn-success" onclick="window.location.href='attendance.html'">📝 Mark Attendance</button>
        <button class="btn btn-primary" onclick="window.location.href='study-materials.html'">📂 Upload Notes</button>
        <button class="btn btn-warning" onclick="window.location.href='assignments.html'">📎 Add Assignment</button>
        <button class="btn btn-outline" onclick="window.location.href='exams.html'">🏆 Enter Exam Marks</button>
      </div>
    </div>
  </div>
`));

// TEACHER - MY CLASSES
writeFile('pages/teacher/my-classes.html', getPortalLayout('teacher', 'My Classes', 'My Assigned Classrooms', `
  <div class="grid-3">
    <div class="card">
      <h4 style="font-size:16px; margin-bottom:8px;">Class 10-A</h4>
      <p><b>Subject:</b> Mathematics</p>
      <p><b>Students:</b> 35 enrolled</p>
      <p><b>Next Class:</b> Tomorrow 8:00 AM</p>
      <button class="btn btn-success" style="width:100%; margin-top:15px;" onclick="alert('Student Roster:\\n1. Aditya Patel\\n2. Arun Das\\n3. Sneha Gupta')">View Student Roster</button>
    </div>
    
    <div class="card">
      <h4 style="font-size:16px; margin-bottom:8px;">Class 12-A</h4>
      <p><b>Subject:</b> Algebra</p>
      <p><b>Students:</b> 42 enrolled</p>
      <p><b>Next Class:</b> Today 12:45 PM</p>
      <button class="btn btn-success" style="width:100%; margin-top:15px;" onclick="alert('Viewing roster for Class 12-A')">View Student Roster</button>
    </div>
  </div>
`));

// TEACHER - ATTENDANCE
writeFile('pages/teacher/attendance.html', getPortalLayout('teacher', 'Attendance', 'Mark Daily Student Attendance', `
  <div class="card">
    <div style="display:flex; gap:15px; margin-bottom:20px;">
      <select class="form-control" style="width:150px;"><option>Class 10-A</option><option>Class 12-A</option></select>
      <button class="btn btn-success">Load Roster</button>
    </div>

    <table class="data-table">
      <thead><tr><th>Roll No</th><th>Name</th><th>Status</th></tr></thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Aditya Patel</td>
          <td>
            <label><input type="radio" name="r1" checked> P</label> &nbsp;
            <label><input type="radio" name="r1"> A</label> &nbsp;
            <label><input type="radio" name="r1"> L</label>
          </td>
        </tr>
        <tr>
          <td>2</td>
          <td>Arun Das</td>
          <td>
            <label><input type="radio" name="r2"> P</label> &nbsp;
            <label><input type="radio" name="r2" checked> A</label> &nbsp;
            <label><input type="radio" name="r2"> L</label>
          </td>
        </tr>
      </tbody>
    </table>
    
    <button class="btn btn-success" style="margin-top:15px;" onclick="App.showToast('Attendance recorded for Class 10-A!')">Save Daily Register</button>
  </div>
`));

// TEACHER - ASSIGNMENTS
writeFile('pages/teacher/assignments.html', getPortalLayout('teacher', 'Assignments', 'Coursework & Submissions', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Create Coursework Assignment</h3>
      <form onsubmit="event.preventDefault(); App.showToast('Assignment uploaded successfully!');">
        <div class="form-group"><label class="form-label">Assignment Title</label><input type="text" class="form-control" required></div>
        <div class="form-group">
          <label class="form-label">Target Class</label>
          <select class="form-control"><option>Class 10-A</option><option>Class 12-A</option></select>
        </div>
        <div class="form-group"><label class="form-label">Due Date</label><input type="date" class="form-control" required></div>
        <div class="form-group"><label class="form-label">Instructions</label><textarea class="form-control" rows="3"></textarea></div>
        <button type="submit" class="btn btn-success" style="width:100%;">Post Assignment</button>
      </form>
    </div>

    <div class="card">
      <h3 class="card-title">Active Homework Tracker</h3>
      <table class="data-table">
        <thead><tr><th>Topic</th><th>Due Date</th><th>Submissions</th></tr></thead>
        <tbody>
          <tr><td>Worksheet 3 - Equations</td><td>20 Jun 2026</td><td>28 / 35</td></tr>
        </tbody>
      </table>
    </div>
  </div>
`));

// TEACHER - STUDY MATERIALS
writeFile('pages/teacher/study-materials.html', getPortalLayout('teacher', 'Study Materials', 'Syllabus & Material Uploads', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Upload Lecture Note / Video Link</h3>
      <form onsubmit="event.preventDefault(); App.showToast('Shared successfully!');">
        <div class="form-group"><label class="form-label">Title</label><input type="text" class="form-control" required></div>
        <div class="form-group">
          <label class="form-label">Material Format Type</label>
          <select class="form-control"><option>PDF</option><option>PPT Slide</option><option>YouTube Video Link</option></select>
        </div>
        <div class="form-group"><label class="form-label">Subject</label><input type="text" class="form-control" value="Mathematics"></div>
        <div class="form-group"><label class="form-label">Link or File Details</label><input type="text" class="form-control" placeholder="URL or file name"></div>
        <button type="submit" class="btn btn-success" style="width:100%;">Share Material</button>
      </form>
    </div>

    <div class="card">
      <h3 class="card-title">Shared Course Materials</h3>
      <table class="data-table">
        <thead><tr><th>Title</th><th>Type</th><th>Upload Date</th></tr></thead>
        <tbody>
          <tr><td>Trigonometry Lecture Notes</td><td><span class="badge badge-purple">PDF</span></td><td>10 Jun 2026</td></tr>
          <tr><td>Pythagoras Theorem Proof Video</td><td><span class="badge badge-info">Video</span></td><td>08 Jun 2026</td></tr>
        </tbody>
      </table>
    </div>
  </div>
`));

// TEACHER - EXAMS & MARKS
writeFile('pages/teacher/exams.html', getPortalLayout('teacher', 'Exams & Marks', 'Marks Ledger Manager', `
  <div class="tab-container">
    <div class="tab active">Enter Marks</div>
    <div class="tab">Create Online MCQ Test</div>
    <div class="tab">Performance Summary</div>
  </div>

  <div class="card">
    <div style="display:flex; gap:15px; margin-bottom:20px;">
      <select class="form-control" style="width:180px;"><option>Quarterly Examination</option><option>Unit Test 2</option></select>
      <select class="form-control" style="width:150px;"><option>Class 10-A</option></select>
      <button class="btn btn-success">Load Records</button>
    </div>

    <table class="data-table">
      <thead><tr><th>Roll No</th><th>Student Name</th><th>Marks Obtained (Max: 100)</th><th>Grade</th><th>Remarks</th></tr></thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Aditya Patel</td>
          <td><input type="number" class="form-control" style="width:80px;" value="95" onchange="App.showToast('Aditya grade auto-updated to A+')"></td>
          <td><b>A+</b></td>
          <td><input type="text" class="form-control" value="Excellent Performance"></td>
        </tr>
        <tr>
          <td>2</td>
          <td>Arun Das</td>
          <td><input type="number" class="form-control" style="width:80px;" value="42"></td>
          <td><b>C</b></td>
          <td><input type="text" class="form-control" value="Needs improvement"></td>
        </tr>
      </tbody>
    </table>
    
    <button class="btn btn-success" style="margin-top:15px;" onclick="App.showToast('Academic marks ledger published!')">Publish Grades</button>
  </div>
`));

// TEACHER - MESSAGES
writeFile('pages/teacher/messages.html', getPortalLayout('teacher', 'Messages', 'Messaging Console', `
  <div class="card" style="display:flex; height:500px; padding:0; overflow:hidden;">
    <div style="width:250px; border-right:1px solid var(--border-color); background-color:var(--gray-100); overflow-y:auto;">
      <div style="padding:15px; font-weight:700; border-bottom:1px solid var(--border-color)">Inbox Threads</div>
      <div style="padding:12px 15px; cursor:pointer; background-color:var(--white);" class="message-thread active">Suresh Patel (Parent)</div>
      <div style="padding:12px 15px; cursor:pointer; border-bottom:1px solid var(--border-color);" class="message-thread">Sumita Roy (Admin)</div>
    </div>
    
    <div style="flex:1; display:flex; flex-direction:column;">
      <div style="padding:15px; font-weight:700; border-bottom:1px solid var(--border-color)">Suresh Patel (Father of Aditya Patel)</div>
      <div style="flex:1; padding:20px; overflow-y:auto; background-color:var(--gray-100);" id="teacherChatbox">
        <p><b>Parent (Suresh):</b> Respected sir, how is Aditya performing in trigonometry? Is he practicing at home?</p>
        <p style="text-align:right; color:var(--success); margin-top:10px;"><b>You:</b> Aditya is doing well. He scored 95% in the mock test. Please ensure he completes daily sheets.</p>
      </div>
      <div style="padding:15px; border-top:1px solid var(--border-color); display:flex; gap:10px;">
        <input type="text" class="form-control" id="teacherChatMsg" placeholder="Type reply here...">
        <button class="btn btn-success" onclick="sendTeacherReply()">Send</button>
      </div>
    </div>
  </div>

  <script>
    function sendTeacherReply() {
      const input = document.getElementById('teacherChatMsg');
      const val = input.value.trim();
      if(!val) return;
      
      const box = document.getElementById('teacherChatbox');
      box.innerHTML += \`<p style="text-align:right; color:var(--success); margin-top:10px;"><b>You:</b> \${val}</p>\`;
      input.value = '';
      box.scrollTop = box.scrollHeight;
    }
  </script>
`));

// TEACHER - PROFILE
writeFile('pages/teacher/profile.html', getPortalLayout('teacher', 'Profile', 'My Staff Profile', `
  <div class="card" style="max-width:600px; margin:0 auto;">
    <div style="text-align:center; margin-bottom:20px;">
      <div class="avatar-circle" style="width:100px; height:100px; font-size:40px; margin:0 auto 15px;">RK</div>
      <h2>Mr. Rajesh Kumar</h2>
      <p style="color:var(--text-muted);">Senior Lecturer - Mathematics Department</p>
    </div>
    
    <table class="data-table">
      <tbody>
        <tr><td><b>Employee ID:</b></td><td>TCH001</td></tr>
        <tr><td><b>Qualification:</b></td><td>M.Sc. Mathematics, B.Ed.</td></tr>
        <tr><td><b>Phone:</b></td><td>+91 94412 34567</td></tr>
        <tr><td><b>Email:</b></td><td>rajesh.maths@amalahss.edu.in</td></tr>
        <tr><td><b>Date of Joining:</b></td><td>12 Aug 2018</td></tr>
      </tbody>
    </table>
  </div>
`));

// 10. GENERATING STUDENT PORTAL PAGES
console.log('Generating Student Pages...');

// STUDENT - DASHBOARD
writeFile('pages/student/dashboard.html', getPortalLayout('student', 'Student Dashboard', 'Welcome back, Aditya!', `
  <div class="card" style="background: linear-gradient(135deg, var(--primary) 0%, #4338CA 100%); color:#FFF;">
    <h2>Aditya Patel | Class 10-A</h2>
    <p>Roll No: 12 | Admission No: ADM2026001</p>
    <p style="margin-top:10px; font-size:12px; color:#E0E7FF;">Academic Session: 2026 - 27</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--primary)"><div class="stat-info"><h3>Attendance</h3><div class="stat-value">92%</div></div></div>
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Assignments Due</h3><div class="stat-value">1 Pending</div></div></div>
    <div class="stat-card" style="border-left-color: var(--warning)"><div class="stat-info"><h3>Average Grade</h3><div class="stat-value">A+ (93%)</div></div></div>
    <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Upcoming Tests</h3><div class="stat-value">1 Test</div></div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Pending Homework</h3>
      <div class="card" style="border-left:4px solid var(--danger); margin-bottom:10px; padding:15px;">
        <h4>Quadratic Equations Practice</h4>
        <p>Subject: Mathematics | Due: 20 Jun 2026</p>
        <button class="btn btn-primary" style="margin-top:10px; padding:4px 8px;" onclick="window.location.href='assignments.html'">Open Worksheet</button>
      </div>
    </div>
    
    <div class="card">
      <h3 class="card-title">Recent Circulars & Announcements</h3>
      <ul style="list-style:none;">
        <li style="padding:8px 0; border-bottom:1px solid var(--border-color)">📢 <b>Holiday Circular</b>: School remains closed on 18th June for local festival.</li>
        <li style="padding:8px 0;">📢 <b>Online Exam Schedule</b>: MCQ Mock test link active from Monday.</li>
      </ul>
    </div>
  </div>
`));

// STUDENT - SUBJECTS
writeFile('pages/student/subjects.html', getPortalLayout('student', 'My Subjects', 'Academic Curriculum', `
  <div class="grid-3">
    <div class="card">
      <h4>Mathematics</h4>
      <p>Course Code: MAT101</p>
      <p>Teacher: Mr. Rajesh Kumar</p>
      <p>Pass Percentage: 35%</p>
      <button class="btn btn-primary" style="width:100%; margin-top:12px;" onclick="alert('Algebra, Geometry, Trigonometry, Statistics')">Syllabus</button>
    </div>
    
    <div class="card">
      <h4>Physics</h4>
      <p>Course Code: PHY101</p>
      <p>Teacher: Mrs. Priya Sharma</p>
      <p>Pass Percentage: 35%</p>
      <button class="btn btn-primary" style="width:100%; margin-top:12px;" onclick="alert('Light, Sound, Electricity, Magnetism')">Syllabus</button>
    </div>
  </div>
`));

// STUDENT - STUDY MATERIALS
writeFile('pages/student/study-materials.html', getPortalLayout('student', 'Study Materials', 'Reference materials & Notes', `
  <div class="grid-3">
    <div class="card">
      <div style="font-size:36px; margin-bottom:10px;">📄</div>
      <h4>Trigonometry Notes</h4>
      <span class="badge badge-purple">PDF Note</span>
      <p style="font-size:12px; margin-top:8px;">Shared by Rajesh Kumar</p>
      <button class="btn btn-outline" style="width:100%; margin-top:15px;" onclick="App.showToast('Downloading document...')">Download Notes</button>
    </div>
    
    <div class="card">
      <div style="font-size:36px; margin-bottom:10px;">🎬</div>
      <h4>Pythagoras Theorem Proof</h4>
      <span class="badge badge-info">Video Link</span>
      <p style="font-size:12px; margin-top:8px;">Shared by Rajesh Kumar</p>
      <button class="btn btn-outline" style="width:100%; margin-top:15px;" onclick="alert('Opening video: YouTube lecture details...')">Watch Video</button>
    </div>
  </div>
`));

// STUDENT - ASSIGNMENTS
writeFile('pages/student/assignments.html', getPortalLayout('student', 'Assignments', 'Assignment Board', `
  <div class="tab-container">
    <div class="tab active">Pending Tasks</div>
    <div class="tab">Submitted Sheets</div>
    <div class="tab">Graded Sheets</div>
  </div>

  <div class="card">
    <h3>Worksheet: Quadratic Equations</h3>
    <p style="margin-bottom:10px;"><b>Due Date:</b> 20 Jun 2026 | <b>Max Marks:</b> 50</p>
    <p style="color:var(--text-muted); margin-bottom:15px;">Complete all 10 problems on paper, scan them to a single PDF, and drag it below.</p>
    
    <div style="border: 2px dashed var(--border-color); padding: 30px; text-align:center; border-radius: var(--radius); margin-bottom:20px; cursor:pointer;" onclick="alert('File Dialog Opened')">
      📂 Click to upload PDF file (Max 5MB)
    </div>
    
    <button class="btn btn-primary" onclick="App.showToast('Assignment submitted successfully!')">Submit Assignment</button>
  </div>
`));

// STUDENT - ONLINE TESTS
writeFile('pages/student/online-tests.html', getPortalLayout('student', 'Online Exams', 'Online MCQ Exam Portal', `
  <div class="card" id="testListCard">
    <h3 class="card-title">Active MCQ Assessments</h3>
    <table class="data-table">
      <thead><tr><th>Exam Name</th><th>Subject</th><th>Questions</th><th>Duration</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        <tr>
          <td>Mathematics Mock Quiz 1</td>
          <td>Mathematics</td>
          <td>10 MCQ</td>
          <td>15 Mins</td>
          <td><span class="badge badge-success">Available</span></td>
          <td><button class="btn btn-primary" onclick="startTestPlayer()">Start Test</button></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Interactive Test Player Interface (hidden by default) -->
  <div class="card" id="testPlayerCard" style="display:none;">
    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:15px; margin-bottom:15px;">
      <h3>Math MCQ Mock Test</h3>
      <div style="font-size:16px; font-weight:700; color:var(--danger);" id="testTimer">Timer: 15:00</div>
    </div>
    
    <div class="grid-2" style="grid-template-columns: 8fr 4fr;">
      <div>
        <div id="questionContainer" style="margin-bottom:20px;">
          <h4 id="questionText" style="margin-bottom:15px;">Q1. Solve for x: 2x + 5 = 15.</h4>
          <div class="form-group"><label><input type="radio" name="mcq" value="a"> a) 3</label></div>
          <div class="form-group"><label><input type="radio" name="mcq" value="b"> b) 5 [Correct]</label></div>
          <div class="form-group"><label><input type="radio" name="mcq" value="c"> c) 10</label></div>
          <div class="form-group"><label><input type="radio" name="mcq" value="d"> d) 8</label></div>
        </div>
        
        <div style="display:flex; gap:10px;">
          <button class="btn btn-outline" id="prevBtn" disabled>Previous</button>
          <button class="btn btn-primary" id="nextBtn" onclick="submitTestAnswers()">Submit Test</button>
        </div>
      </div>

      <div style="border-left:1px solid var(--border-color); padding-left:20px;">
        <h4>Question Navigation</h4>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-top:15px;">
          <button class="btn btn-primary" style="padding:6px; font-size:11px;">1</button>
          <button class="btn btn-outline" style="padding:6px; font-size:11px;">2</button>
          <button class="btn btn-outline" style="padding:6px; font-size:11px;">3</button>
          <button class="btn btn-outline" style="padding:6px; font-size:11px;">4</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card" id="testResultCard" style="display:none;">
    <h3 style="color:var(--success)">Test Submitted Successfully!</h3>
    <p>Your responses have been processed.</p>
    <div class="stats-grid" style="margin-top:20px;">
      <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Obtained Score</h3><div class="stat-value">1 / 1</div></div></div>
      <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Correct Answers</h3><div class="stat-value">1</div></div></div>
      <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Wrong Answers</h3><div class="stat-value">0</div></div></div>
    </div>
    <button class="btn btn-outline" style="margin-top:15px;" onclick="window.location.reload()">Back to Exam Portal</button>
  </div>

  <script>
    let timerInterval;
    function startTestPlayer() {
      document.getElementById('testListCard').style.display = 'none';
      document.getElementById('testPlayerCard').style.display = 'block';
      let sec = 900;
      timerInterval = setInterval(() => {
        sec--;
        let minPart = Math.floor(sec / 60);
        let secPart = sec % 60;
        document.getElementById('testTimer').innerText = 'Timer: ' + minPart.toString().padStart(2, '0') + ':' + secPart.toString().padStart(2, '0');
        if(sec <= 0) {
          clearInterval(timerInterval);
          submitTestAnswers();
        }
      }, 1000);
    }

    function submitTestAnswers() {
      clearInterval(timerInterval);
      document.getElementById('testPlayerCard').style.display = 'none';
      document.getElementById('testResultCard').style.display = 'block';
      App.showToast('Test results processed!');
    }
  </script>
`));

// STUDENT - TIMETABLE
writeFile('pages/student/timetable.html', getPortalLayout('student', 'Timetable', 'My Weekly Timetable', `
  <div class="card">
    <div style="text-align:right; margin-bottom:15px;">
      <button class="btn btn-primary" onclick="window.print()">Print Timetable</button>
    </div>
    <table class="data-table" style="text-align:center;">
      <thead>
        <tr><th>Time Slot</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th><th>Saturday</th></tr>
      </thead>
      <tbody>
        <tr><td><b>08:00 - 08:45</b></td><td style="background-color:var(--primary-light);">Math</td><td>Physics</td><td style="background-color:var(--primary-light);">Math</td><td>Chemistry</td><td>English</td><td>Library</td></tr>
        <tr><td><b>08:45 - 09:30</b></td><td>English</td><td style="background-color:var(--primary-light);">Math</td><td>Chemistry</td><td>English</td><td>Physics</td><td>Sports</td></tr>
      </tbody>
    </table>
  </div>
`));

// STUDENT - ATTENDANCE
writeFile('pages/student/attendance.html', getPortalLayout('student', 'Attendance', 'My Attendance record', `
  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Attendance Statistics</h3>
      <table class="data-table">
        <tbody>
          <tr><td><b>Total Working Days:</b></td><td>120 Days</td></tr>
          <tr><td><b>Present Count:</b></td><td>110 Days</td></tr>
          <tr><td><b>Absent Count:</b></td><td>8 Days</td></tr>
          <tr><td><b>Late Entry:</b></td><td>2 Days</td></tr>
          <tr><td><b>Overall Rate:</b></td><td><b style="color:var(--success)">92%</b></td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 class="card-title">Subject-wise Attendance</h3>
      <table class="data-table">
        <thead><tr><th>Subject</th><th>Attendance %</th></tr></thead>
        <tbody>
          <tr><td>Mathematics</td><td>95%</td></tr>
          <tr><td>Physics</td><td>90%</td></tr>
          <tr><td>English</td><td>92%</td></tr>
        </tbody>
      </table>
    </div>
  </div>
`));

// STUDENT - RESULTS
writeFile('pages/student/results.html', getPortalLayout('student', 'Results', 'My Term Marks', `
  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <h3 class="card-title">Quarterly Examination Performance</h3>
      <button class="btn btn-primary" onclick="window.location.href='report-card.html'">Print Official Report Card</button>
    </div>

    <table class="data-table">
      <thead><tr><th>Subject</th><th>Max Marks</th><th>Marks Obtained</th><th>Grade</th><th>Remarks</th></tr></thead>
      <tbody>
        <tr><td>Mathematics</td><td>100</td><td>95</td><td>A+</td><td>Outstanding</td></tr>
        <tr><td>Physics</td><td>100</td><td>88</td><td>A</td><td>Very Good</td></tr>
        <tr><td>Chemistry</td><td>100</td><td>84</td><td>A</td><td>Good</td></tr>
        <tr><td>English</td><td>100</td><td>91</td><td>A+</td><td>Excellent</td></tr>
      </tbody>
    </table>

    <div style="margin-top:20px; font-weight:700;">
      Total: 358 / 400 | Percentage: 89.5% | Overall Result: <span class="badge badge-success">Passed</span>
    </div>
  </div>
`));

// STUDENT - REPORT CARD -- ALREADY WRITTEN IN ROOT / SPECIFIC BUT WE INJECT AN IFRAME OR DIRECT NAVIGATION TO RENDER

// STUDENT - AI ASSISTANT
writeFile('pages/student/ai-assistant.html', getPortalLayout('student', 'AI Study Assistant', 'AI Study Partner (Claude Engine)', `
  <div class="card" style="display:flex; flex-direction:column; height:500px;">
    <div style="padding:15px; border-bottom:1px solid var(--border-color)">
      <p><b>StudyBot:</b> I can help you solve math equations, explain biology concepts or grammar rules.</p>
    </div>
    <div style="flex:1; padding:20px; overflow-y:auto; background-color:var(--gray-100);" id="studentChatPanel">
      <p><b>StudyBot:</b> Select a suggested question or write yours below!</p>
      <div style="display:flex; gap:10px; margin-top:15px;">
        <button class="btn btn-outline" style="font-size:12px; padding:6px;" onclick="askAssistant('Explain photosynthesis')">Explain Photosynthesis 🌿</button>
        <button class="btn btn-outline" style="font-size:12px; padding:6px;" onclick="askAssistant('Solve equation 3x-7=14')">Solve equation 3x-7=14 📐</button>
      </div>
    </div>
    <div style="padding:15px; display:flex; gap:10px; border-top:1px solid var(--border-color);">
      <input type="text" class="form-control" id="studentChatMsg" placeholder="Ask Claude study engine...">
      <button class="btn btn-primary" onclick="sendStudentAiMsg()">Ask</button>
    </div>
  </div>

  <script>
    function askAssistant(prompt) {
      document.getElementById('studentChatMsg').value = prompt;
      sendStudentAiMsg();
    }

    function sendStudentAiMsg() {
      const input = document.getElementById('studentChatMsg');
      const val = input.value.trim();
      if(!val) return;
      
      const panel = document.getElementById('studentChatPanel');
      panel.innerHTML += \`<p style="text-align:right; margin-top:10px;"><b>You:</b> \${val}</p>\`;
      input.value = '';
      
      panel.innerHTML += \`<p style="color:var(--primary); margin-top:10px;"><b>StudyBot:</b> Analyzing doubt. Reading curriculum guides...</p>\`;
      
      setTimeout(() => {
        panel.innerHTML += \`<p style="color:var(--primary); margin-top:5px;"><b>StudyBot:</b> Here is the step-by-step resolution: Photosynthesis is the chemical process by which plants convert sunlight, carbon dioxide, and water into oxygen and glucose. The key component is Chlorophyll. Formula: 6CO2 + 6H2O -> C6H12O6 + 6O2.</p>\`;
        panel.scrollTop = panel.scrollHeight;
      }, 1000);
    }
  </script>
`));

// STUDENT - CHAT
writeFile('pages/student/chat.html', getPortalLayout('student', 'Chat', 'Internal School Chat', `
  <div class="card" style="height:450px; display:flex; align-items:center; justify-content:center;">
    <p>Messaging console loading. Links parent, class teacher, and admin channels.</p>
  </div>
`));

// STUDENT - PROFILE
writeFile('pages/student/profile.html', getPortalLayout('student', 'Profile', 'Student Card', `
  <div class="card" style="max-width:500px; margin:0 auto; text-align:center;">
    <div class="avatar-circle" style="width:80px; height:80px; font-size:32px; margin:0 auto 15px;">AP</div>
    <h2>Aditya Patel</h2>
    <p>Grade 10-A | Roll No: 12</p>
    <table class="data-table" style="margin-top:20px; text-align:left;">
      <tbody>
        <tr><td><b>Admission No:</b></td><td>ADM2026001</td></tr>
        <tr><td><b>Aadhar Number:</b></td><td>1234-5678-9012</td></tr>
        <tr><td><b>DOB:</b></td><td>14 May 2011</td></tr>
        <tr><td><b>Blood Group:</b></td><td>O+</td></tr>
        <tr><td><b>Parent:</b></td><td>Suresh Patel</td></tr>
      </tbody>
    </table>
  </div>
`));

// 11. GENERATING PARENT PORTAL PAGES
console.log('Generating Parent Pages...');

// PARENT - DASHBOARD
writeFile('pages/parent/dashboard.html', getPortalLayout('parent', 'Parent Dashboard', 'Parent Portal Console', `
  <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
    <div>
      <h2>Ward: Aditya Patel</h2>
      <p>Class 10-A | Roll No: 12</p>
    </div>
    <div>
      <select class="form-control" style="width:180px;"><option>Aditya Patel</option></select>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card" style="border-left-color: var(--success)"><div class="stat-info"><h3>Monthly Attendance</h3><div class="stat-value">92%</div></div></div>
    <div class="stat-card" style="border-left-color: var(--primary)"><div class="stat-info"><h3>Academic Average</h3><div class="stat-value">A+ (93%)</div></div></div>
    <div class="stat-card" style="border-left-color: var(--danger)"><div class="stat-info"><h3>Outstanding Fees</h3><div class="stat-value">₹12,500</div></div></div>
    <div class="stat-card" style="border-left-color: var(--warning)"><div class="stat-info"><h3>Upcoming Exams</h3><div class="stat-value">1 Scheduled</div></div></div>
  </div>

  <div class="grid-2">
    <div class="card">
      <h3 class="card-title">Homework Progress</h3>
      <table class="data-table">
        <thead><tr><th>Subject</th><th>Assignment Title</th><th>Due Date</th></tr></thead>
        <tbody>
          <tr><td>Mathematics</td><td>Quadratic Equations</td><td>20 Jun 2026</td></tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <h3 class="card-title">Announcements</h3>
      <p>No new updates. General monthly assembly holiday list posted.</p>
    </div>
  </div>
`));

// PARENT - ATTENDANCE
writeFile('pages/parent/attendance.html', getPortalLayout('parent', 'Attendance', 'Ward Attendance Registry', `
  <div class="card">
    <h3 class="card-title">Monthly Calendar Matrix</h3>
    <p>Color coded overview of Aditya's daily presence register.</p>
    
    <div class="heatmap-calendar">
      <div class="heatmap-day heatmap-present">1</div>
      <div class="heatmap-day heatmap-present">2</div>
      <div class="heatmap-day heatmap-present">3</div>
      <div class="heatmap-day heatmap-present">4</div>
      <div class="heatmap-day heatmap-absent">5</div>
      <div class="heatmap-day heatmap-present">6</div>
      <div class="heatmap-day heatmap-holiday">7</div>
      <div class="heatmap-day heatmap-present">8</div>
      <div class="heatmap-day heatmap-present">9</div>
    </div>
  </div>
`));

// PARENT - RESULTS
writeFile('pages/parent/results.html', getPortalLayout('parent', 'Results', 'Ward Grade Reports', `
  <div class="card">
    <table class="data-table">
      <thead><tr><th>Subject</th><th>Obtained Marks</th><th>Remarks</th></tr></thead>
      <tbody>
        <tr><td>Mathematics</td><td>95 / 100</td><td>Excellent</td></tr>
        <tr><td>Physics</td><td>88 / 100</td><td>Good progress</td></tr>
      </tbody>
    </table>
    <button class="btn btn-primary" style="margin-top:15px;" onclick="alert('Downloading ward report card PDF...')">Download Ward Report Card PDF</button>
  </div>
`));

// PARENT - HOMEWORK
writeFile('pages/parent/homework.html', getPortalLayout('parent', 'Homework', 'Ward Assignments Tracker', `
  <div class="card">
    <table class="data-table">
      <thead><tr><th>Subject</th><th>Assignment Title</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Mathematics</td><td>Quadratic Equations Sheet</td><td><span class="badge badge-warning">Pending Submission</span></td></tr>
      </tbody>
    </table>
  </div>
`));

// PARENT - FEES
writeFile('pages/parent/fees.html', getPortalLayout('parent', 'Fees', 'Ward Financial Billing', `
  <div class="card">
    <h3>Outstanding Balance: ₹12,500</h3>
    <table class="data-table" style="margin-top:15px;">
      <thead><tr><th>Term</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Term 1 Tuition</td><td>Academic 2026-27</td><td>₹25,000</td><td><span class="badge badge-success">Paid</span></td></tr>
        <tr><td>Term 2 Tuition</td><td>Academic 2026-27</td><td>₹12,500</td><td><span class="badge badge-danger">Due</span></td></tr>
      </tbody>
    </table>
    
    <div style="margin-top:20px;">
      <button class="btn btn-primary" onclick="alert('Razorpay Checkout: redirecting to gateway...')">💳 Pay Online Now</button>
      <button class="btn btn-outline" onclick="alert('Downloading billing receipt history...')">Receipt History PDF</button>
    </div>
  </div>
`));

// PARENT - MESSAGES
writeFile('pages/parent/messages.html', getPortalLayout('parent', 'Messages', 'Messaging Console', `
  <div class="card" style="height:400px; display:flex; align-items:center; justify-content:center;">
    <p>Messaging console loading. Connecting with class teacher Mr. Rajesh Kumar.</p>
  </div>
`));

// PARENT - PROFILE
writeFile('pages/parent/profile.html', getPortalLayout('parent', 'Profile', 'Parent Account Details', `
  <div class="card" style="max-width:500px; margin:0 auto;">
    <h3 style="text-align:center; margin-bottom:20px;">Suresh Patel</h3>
    <table class="data-table">
      <tbody>
        <tr><td><b>Email Address:</b></td><td>suresh@example.com</td></tr>
        <tr><td><b>Contact Phone:</b></td><td>+91 98765 43210</td></tr>
        <tr><td><b>Home Address:</b></td><td>24, Sector B, Gandhi Nagar, TN</td></tr>
        <tr><td><b>Primary Ward:</b></td><td>Aditya Patel (Class 10-A)</td></tr>
      </tbody>
    </table>
  </div>
`));

// 12. BACKEND SERVER CONFIGURATION
console.log('Generating Backend Server Files...');

// backend/server.js
const serverJs = `const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Static Routing to Login (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Simple Mock Routes API
app.post('/api/auth/login', (req, res) => {
  const { user_id, password, role } = req.body;
  // Simple validation logic
  res.json({ success: true, token: 'mock-jwt-token-xyz', role });
});

// Mock AI endpoint
app.post('/api/ai/call', (req, res) => {
  const { prompt, systemPrompt } = req.body;
  res.json({ text: "Simulated response from Claude Sonnet matching curriculum requirements." });
});

// Socket.io Real-time Channels
io.on('connection', (socket) => {
  console.log('User connected to EduSphere real-time notification socket');
  socket.on('broadcastNotice', (data) => {
    io.emit('newNotice', data);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(\`EduSphere LMS Server running on http://localhost:\${PORT}\`);
});
`;

writeFile('backend/server.js', serverJs);

// backend/routes/auth.js
writeFile('backend/routes/auth.js', `// Auth Route Router
const express = require('express');
const router = express.Router();
router.post('/login', (req, res) => {
  res.json({ message: "Mock login endpoint active" });
});
module.exports = router;
`);

// Other route files
writeFile('backend/routes/students.js', `module.exports = {};`);
writeFile('backend/routes/teachers.js', `module.exports = {};`);
writeFile('backend/routes/attendance.js', `module.exports = {};`);
writeFile('backend/routes/exams.js', `module.exports = {};`);
writeFile('backend/routes/fees.js', `module.exports = {};`);
writeFile('backend/routes/ai.js', `module.exports = {};`);

// Middleware and models stubs
writeFile('backend/middleware/auth.js', `module.exports = (req, res, next) => { next(); };`);
writeFile('backend/middleware/roleCheck.js', `module.exports = (roles) => (req, res, next) => { next(); };`);

writeFile('backend/models/User.js', `module.exports = {};`);
writeFile('backend/models/Student.js', `module.exports = {};`);
writeFile('backend/models/Teacher.js', `module.exports = {};`);
writeFile('backend/models/Attendance.js', `module.exports = {};`);
writeFile('backend/models/Exam.js', `module.exports = {};`);
writeFile('backend/models/Fee.js', `module.exports = {};`);

console.log('EduSphere LMS generation script created successfully!');
