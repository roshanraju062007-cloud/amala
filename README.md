# 🏫 EduSphere LMS — Amala Higher Secondary School

<div align="center">

![EduSphere Banner](https://img.shields.io/badge/EduSphere-LMS%20v1.0-4F46E5?style=for-the-badge&logo=graduation-cap)
![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v17+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

**A secure, production-ready Learning Management System with PostgreSQL database + HTTP-only JWT sessions + bcrypt encryption.**

</div>

---

## 📖 Overview

**EduSphere LMS** is a full-stack, secure, and production-ready Learning Management System built for **Amala Higher Secondary School** (Estd. 1977). It covers all school operations — from LKG to 12th Standard — with dedicated portals for **Admins**, **Teachers**, **Students**, and **Parents**.

The system has been fully migrated from a demo client-side mock to a real backend architecture powered by:
- **PostgreSQL** (with a self-contained embedded database option for easy zero-config launching)
- **JWT (JSON Web Tokens)** stored in secure, **HTTP-only cookies** for robust session management
- **bcryptjs** for hashing and verifying passwords on the server side
- **Express + Socket.IO** for static asset serving, real-time messaging, and notifications

---

## ✨ Features

### 🛡️ Admin Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Live stats queried directly from PostgreSQL |
| 🎓 Student Registry | Register, update, and manage student accounts |
| 👨‍🏫 Faculty Directory | Add, update, and assign teachers to classes/subjects |
| 👪 Parent Console | View and edit parent records linked to students |
| 🏫 Classes & Sections | Manage standard structure (LKG to 12th) and sections |
| 📚 Subjects | Map curriculum subjects to classes and assign teachers |
| 📅 Timetable | Define period-by-period schedules |
| 📝 Attendance | Review school-wide attendance records |
| ✍️ Exams | Manage academic examination schedules |
| 📎 Assignments | Monitor student coursework submissions |
| 🏆 Results | Publish exam grades and marks |
| 💳 Fee Management | Track due, paid, and outstanding balances |
| 📖 Library | Manage catalog and book issue logs |
| 🚌 Transport | Define bus routes and register passenger students |
| 🔔 Notifications | Broadcast school-wide notices |
| 📈 Analytics | Render performance trend charts from real data |
| 🤖 AI Tools | AI-powered assistant tools |
| ⚙️ Settings | Global application configurations |

### 👨‍🏫 Teacher Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | View teaching assignments, class rosters, and alerts |
| 🏫 My Classes | Access list of assigned classes and student details |
| 📝 Attendance | Mark daily student attendance (Present / Absent / Leave) |
| 📎 Assignments | Create homework assignments with due dates and marks |
| 📚 Study Materials | Share files, notes, and external reference links with students |
| ✍️ Exams & Marks | Input exam scores, auto-assign grades, and publish results |
| 💬 Messages | Read and write messages to other portal users |
| 👤 Profile | Manage password and contact details |

### 🎓 Student Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | View personal attendance trend, subjects, and announcements |
| 📚 Curriculum | View list of courses and assigned subject teachers |
| 📖 Study Materials | Access notes and files shared by teachers |
| 📎 Assignments | View coursework details and submit homework |
| ✍️ Online Tests | Participate in online quizzes and practice assessments |
| 📅 Timetable | View weekly class periods |
| 📝 Attendance | Review date-wise attendance records |
| 🏆 Results | View published exam report cards and GPA grades |
| 📄 Report Card | Generate a printable report card |
| 🤖 AI Study Buddy | Leverage AI study tools |
| 💬 Chat Inbox | Communicate with teachers and classmates |
| 👤 Profile | View profile and edit settings |

### 👪 Parent Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Comprehensive overview of child's stats (attendance, marks, homework) |
| 📝 Attendance | Track child's daily presence and absence logs |
| 🏆 Results | View child's report cards and grades |
| 📎 Homework Tracker | Monitor pending and completed assignments for the child |
| 💳 Fee Account | View billing logs, amount paid, and pay outstanding balances |
| 📅 Timetable | View child's daily school schedule |
| 📚 Coursework | Check standard subjects and teachers |
| 💬 Teacher Inbox | Message child's class and subject teachers directly |
| 👤 Profile Console | Manage parent contact info and view child details |

---

## 🏗️ Project Architecture

```
amala/
├── start.js                      # Auto-start script (launches embedded Postgres + Express)
├── index.html                    # Unified login page
├── backend/
│   ├── server.js                 # Express + Socket.IO server config
│   ├── db.js                     # PostgreSQL connection pool using 'pg'
│   ├── middleware/
│   │   └── auth.js               # JWT verification & role validation middleware
│   └── routes/
│       ├── auth.js               # Real session auth (login, logout, session verify)
│       ├── api.js                # Integrated database APIs (classes, subjects, results...)
│       ├── students.js           # Student REST CRUD endpoints
│       └── teachers.js           # Teacher REST CRUD endpoints
├── database/
│   ├── schema.sql                # Full PostgreSQL table definitions
│   └── setup.js                  # Database setup and full LMS seeder script
├── js/
│   ├── app.js                    # Core client API wrapper (fetch client + theme helper)
│   ├── login.js                  # Login form handler (real API verification)
│   └── auth-check.js             # Client-side router auth-guard (on every portal page)
├── css/
│   ├── main.css                  # Global stylesheet (dark mode, grids, forms)
│   └── login.css                 # Login page aesthetics
└── pages/
    ├── admin/                    # Admin portal console pages
    ├── teacher/                  # Faculty workspace pages
    ├── student/                  # Learner cockpit pages
    └── parent/                   # Guardian observer pages
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (installed with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/amala-edusphere.git
cd amala-edusphere
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server (with Auto-Start Embedded PostgreSQL)
To start the application with a zero-config, embedded PostgreSQL server that starts up automatically in the background:
```bash
node start.js
```
The start script will:
1. Initialize a localized PostgreSQL database cluster in the `./.pgdata` directory (if running for the first time).
2. Start the embedded PostgreSQL server on port **5433** (so it won't conflict with any existing PostgreSQL servers running on port 5432).
3. Auto-apply the database schema from `database/schema.sql`.
4. Seed the default Admin user.
5. Launch the Express server at [http://localhost:3000](http://localhost:3000).

### 4. Seed Full Demo Dataset
To populate the database with the full test dataset (classes, teachers, students, parents, timetables, and notice boards):
```bash
node database/setup.js
```
This will seed:
- **22 classes** (LKG to 12th standard with different groups/streams)
- **22 teachers** (TCH001 to TCH022)
- **110 students** (STU001 to STU110)
- **110 parents** (PAR001 to PAR110)
- Subjects mapped to classes and teachers
- Academic schedules, timetable entries, and notices

---

## 🔐 Credentials for Testing

| Role | User ID | Password | Notes |
|------|---------|----------|-------|
| 🛡️ **Admin** | `admin` | `admin123` | System configuration and directory administration |
| 👨‍🏫 **Teacher** | `TCH001` | `teach123` | Assigned to LKG |
| 🎓 **Student** | `STU001` | `stud123` | Enrolled in LKG Section A |
| 👪 **Parent** | `PAR001` | `par123` | Linked to student STU001 |

> 💡 **Quick Fill:** Click the **"Use Demo"** badge under the login form to automatically select the role tab, fill in the correct User ID and password, and automatically fill in the security CAPTCHA code!

## 🤖 AI assistant setup

The AI assistant uses `ANTHROPIC_API_KEY` from your local `.env` file.

- Copy `.env.example` to `.env` for a fresh setup.
- Replace `ANTHROPIC_API_KEY=your_anthropic_api_key_here` with your own key.
- Keep `.env` out of GitHub; only commit `.env.example`.

There is no safe or legitimate way to ship a "free permanent" API key in the repository. Use your own account key and keep it server-side only.

---

## 🌐 Public Access via Tunnel

To expose the server to the internet (e.g. for testing on mobile or sharing with parents/students):
```bash
npx localtunnel --port 3000
```
This generates a public URL like `https://xxxx.loca.lt` that maps to your local server.

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🙏 Acknowledgements

- **Amala Higher Secondary School** — Estd. 1977
- Built with ❤️ using Node.js, Express, PostgreSQL, Socket.IO, and Vanilla Web Stack.

---

<div align="center">

**© 2026 Amala Higher Secondary School — EduSphere LMS v1.0**

*"Empowering education through technology"*

</div>
