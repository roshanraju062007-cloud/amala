# 🏫 EduSphere LMS — Amala Higher Secondary School

<div align="center">

![EduSphere Banner](https://img.shields.io/badge/EduSphere-LMS%20v1.0-4F46E5?style=for-the-badge&logo=graduation-cap)
![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

**A full-stack, role-based Learning Management System for Amala Higher Secondary School (LKG–12th Standard)**

</div>

---

## 📖 Overview

**EduSphere LMS** is a complete, production-ready Learning Management System built for **Amala Higher Secondary School** (Estd. 1977). It covers all school operations — from LKG to 12th Standard — with dedicated portals for **Admins**, **Teachers**, **Students**, and **Parents**.

The system uses a **localStorage-first architecture** for instant data persistence in the browser with a **Node.js + Express + Socket.IO** backend server for static file serving and real-time notifications.

---

## ✨ Features

### 🛡️ Admin Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Live stats — students, teachers, fees, and notices |
| 🎓 Student Registry | Add, search, and manage all students (LKG–12th) |
| 👨‍🏫 Faculty Directory | Register teachers, assign classes, manage credentials |
| 👪 Parent Management | View all parent records linked to students |
| 🏫 Classes & Sections | Manage class structure with sections (A–D) |
| 📚 Subjects | Subject assignment per class and teacher |
| 📅 Timetable | Academic schedule management |
| 📝 Attendance | School-wide attendance overview |
| ✍️ Exams | Exam schedule and configuration |
| 📎 Assignments | Monitor all assignments across classes |
| 🏆 Results | View and manage student results |
| 💳 Fee Management | Track fee status (Paid / Partial / Unpaid) |
| 📖 Library | Library records management |
| 🚌 Transport | School bus and route management |
| 🔔 Notifications | Broadcast school-wide announcements |
| 📈 Analytics | Academic performance analytics with charts |
| 🤖 AI Tools | AI-powered academic tools |
| ⚙️ Settings | System-wide configuration |

### 👨‍🏫 Teacher Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Personal stats — my classes, students, assignments |
| 🏫 My Classes | View assigned classes and student rosters |
| 📝 Attendance | Mark daily attendance (Present / Absent / Leave) |
| 📎 Assignments | Create and manage homework assignments |
| 📚 Study Materials | Upload and share lecture notes, PDFs, video links |
| ✍️ Exams & Marks | Enter exam marks, auto-calculate grades, publish results |
| 💬 Messages | Faculty communication inbox |
| 👤 Profile | Teacher profile and account settings |

### 🎓 Student Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Overview of attendance, subjects, and pending homework |
| 📚 Curriculum Subjects | View all subjects for enrolled class |
| 📖 Study Materials | Access teacher-shared notes and resources |
| 📎 Assignments | Submit homework and view task details |
| ✍️ Online Tests | Take online tests and quizzes |
| 📅 Class Timetable | View weekly class schedule |
| 📝 Attendance Log | Personal attendance record |
| 🏆 Results & Internals | View exam marks and CIA scores |
| 📄 Term Report Card | Printable academic progress report with grades |
| 🤖 AI Study Assistant | AI-powered study help |
| 💬 Chat Inbox | Message faculty and peers |
| 👤 Student Profile | Personal academic profile |

### 👪 Parent Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Ward's academic overview |
| 📝 Attendance Log | Child's daily attendance records |
| 🏆 Results & CIA | Exam marks and internal assessment scores |
| 📎 Ward Homework | Monitor pending and completed assignments |
| 💳 Fee Account | Fee status and payment history |
| 📅 Class Timetable | Child's class schedule |
| 📚 Curriculum Subjects | Enrolled subjects overview |
| 📖 Study Materials | Access shared resources |
| 💬 Faculty Inbox | Communicate with teachers |
| 👤 Profile Console | Parent and child profile management |

---

## 🏗️ Project Architecture

```
amala/
├── index.html                    # Login page (all 4 roles)
├── backend/
│   └── server.js                 # Express + Socket.IO server
├── css/
│   ├── main.css                  # Global stylesheet (dark mode, components)
│   └── login.css                 # Login page styles
├── js/
│   ├── app.js                    # Shared utilities + AppState (localStorage seeder)
│   ├── login.js                  # Login controller (4-role auth)
│   └── auth-check.js             # Auth guard (injected into all portal pages)
├── pages/
│   ├── admin/                    # 18 admin portal pages
│   ├── teacher/                  # 8 teacher portal pages
│   ├── student/                  # 12 student portal pages
│   └── parent/                   # 10 parent portal pages
└── package.json
```

### Data Architecture (localStorage Keys)

| Key | Description |
|-----|-------------|
| `lms_classes` | Class list (LKG–12th with sections) |
| `lms_teachers` | Teacher records (ID, name, dept, password) |
| `lms_students` | Student records (ID, name, class, parent, passwords) |
| `lms_subjects` | Subject list per class |
| `lms_attendance` | Attendance records by date/class/section |
| `lms_assignments` | Assignment list |
| `lms_submissions` | Student homework submissions |
| `lms_materials` | Study materials shared by teachers |
| `lms_results` | Exam results and grades |
| `lms_exams` | Exam schedule |
| `lms_notices` | School announcements |
| `lms_chat` | Internal messages |
| `userRole` | Logged-in user's role |
| `userId` | Logged-in user's ID |
| `userName` | Logged-in user's display name |
| `childId` | Child student ID (for parent login) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/amala-edusphere.git
cd amala-edusphere
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
node backend/server.js
```
The server starts at **http://localhost:3000**

### 4. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

> 📝 **First Launch:** On first visit, `AppState.init()` automatically seeds all localStorage data — classes, teachers, students, subjects, and sample results.

---

## 🔐 Login Credentials

| Role | User ID | Password | Notes |
|------|---------|----------|-------|
| 🛡️ **Admin** | `admin` | `admin123` | Full system access |
| 👨‍🏫 **Teacher** | `TCH001` | `teach123` | First teacher in directory |
| 🎓 **Student** | `STU001` | `stud123` | First student (LKG) |
| 👪 **Parent** | `PAR001` | `par123` | Parent of STU001 |

> 💡 **Quick Fill:** Click the **"▶ Demo"** badge on the login page to auto-fill credentials and the CAPTCHA in one click!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, Vanilla CSS, Vanilla JavaScript |
| **Backend** | Node.js, Express v5 |
| **Real-time** | Socket.IO v4 |
| **Data Store** | Browser localStorage (client-side) |
| **Charts** | Custom Canvas API bar/line charts |
| **Authentication** | Role-based session via localStorage |
| **Styling** | CSS custom properties, Dark mode support |

---

## 📦 Seeded Data (on first launch)

| Entity | Count | Details |
|--------|-------|---------|
| Classes | 21 | LKG, UKG, 1st–10th, 11th & 12th (5 streams each) |
| Teachers | 21 | One per class, IDs TCH001–TCH021, password: teach123 |
| Students | 840+ | ~40 per class, IDs STU001+, password: stud123 |
| Parents | 840+ | One per student, IDs PAR001+, password: par123 |
| Subjects | 100+ | 5–6 per class based on curriculum stream |
| Notices | 4 | Welcome announcements |
| Assignments | 1 | Sample math assignment |

---

## 🌐 Public Access via Tunnel

To share the site over the internet during development:

```bash
npx localtunnel --port 3000
```

This generates a public URL like `https://your-name.loca.lt`

> ⚠️ First-time visitors must click **"Click to Submit"** on the localtunnel splash page before accessing the site.

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `backend/server.js` | Express static server + Socket.IO setup |
| `js/app.js` | AppState data seeder + shared utilities (App object) |
| `js/login.js` | 4-role authentication controller with CAPTCHA |
| `js/auth-check.js` | Auth guard injected in all 48 portal pages |
| `index.html` | Main login page |
| `css/main.css` | Global design system + dark mode + all components |

---

## 🔒 Security Notes

> This system uses **localStorage** for client-side data persistence and is designed for **school intranet / demonstration use**. For production with sensitive data:
> - Migrate to a proper backend database (MongoDB, PostgreSQL)
> - Implement server-side JWT authentication
> - Use HTTPS with SSL certificates
> - Hash passwords with bcrypt on the server side

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- **Amala Higher Secondary School** — Estd. 1977
- Built with ❤️ using Node.js, Express, Socket.IO, and Vanilla JavaScript

---

<div align="center">

**© 2026 Amala Higher Secondary School — EduSphere LMS v1.0**

*"Empowering education through technology"*

</div>
