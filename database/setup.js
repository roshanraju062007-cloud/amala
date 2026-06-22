/**
 * EduSphere LMS — Database Setup & Seed Script
 * Creates database, runs schema, and seeds initial data
 * Run: node database/setup.js
 */
require('dotenv').config();
const { Client } = require('pg');
const bcrypt     = require('bcryptjs');
const fs         = require('fs');
const path       = require('path');

const DB_CONFIG = {
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};
const DB_NAME = process.env.DB_NAME || 'edusphere_db';

async function createDatabase() {
  const client = new Client({ ...DB_CONFIG, database: 'postgres' });
  await client.connect();
  const exists = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]);
  if (exists.rows.length === 0) {
    await client.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`✅ Database "${DB_NAME}" created.`);
  } else {
    console.log(`ℹ️  Database "${DB_NAME}" already exists.`);
  }
  await client.end();
}

async function runSchema(client) {
  let schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  schema = schema.replace(/[^\x00-\x7F]/g, '-');
  await client.query(schema);
  console.log('✅ Schema applied (all tables created).');
}

async function seedData(client) {
  const SALT_ROUNDS = 10;
  console.log('\n📦 Seeding data...\n');

  // ── CLASSES ────────────────────────────────────────────────────────
  const classList = [
    { name: 'LKG',         sections: ['A','B'] },
    { name: 'UKG',         sections: ['A','B','C'] },
    { name: '1st Standard', sections: ['A','B'] },
    { name: '2nd Standard', sections: ['A','B'] },
    { name: '3rd Standard', sections: ['A','B'] },
    { name: '4th Standard', sections: ['A','B'] },
    { name: '5th Standard', sections: ['A','B'] },
    { name: '6th Standard', sections: ['A','B'] },
    { name: '7th Standard', sections: ['A','B'] },
    { name: '8th Standard', sections: ['A','B'] },
    { name: '9th Standard', sections: ['A','B'] },
    { name: '10th Standard', sections: ['A','B','C','D'] },
    { name: '11th Standard - Computer Science with Mathematics', sections: ['A'] },
    { name: '11th Standard - Biology with Mathematics',          sections: ['A'] },
    { name: '11th Standard - Pure Science',                      sections: ['A'] },
    { name: '11th Standard - Commerce with Computer Application', sections: ['A'] },
    { name: '11th Standard - Commerce with Business Maths',      sections: ['A'] },
    { name: '12th Standard - Computer Science with Mathematics', sections: ['A'] },
    { name: '12th Standard - Biology with Mathematics',          sections: ['A'] },
    { name: '12th Standard - Pure Science',                      sections: ['A'] },
    { name: '12th Standard - Commerce with Computer Application', sections: ['A'] },
    { name: '12th Standard - Commerce with Business Maths',      sections: ['A'] },
  ];

  for (const cls of classList) {
    await client.query(
      `INSERT INTO classes (name, sections, students_count)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO NOTHING`,
      [cls.name, cls.sections, 40]
    );
  }
  console.log(`  ✅ ${classList.length} classes seeded.`);

  // ── ADMIN USER ─────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
  await client.query(
    `INSERT INTO users (user_id, password, role, name, email)
     VALUES ('admin', $1, 'admin', 'Administrator', 'admin@amalahss.edu.in')
     ON CONFLICT (user_id) DO NOTHING`,
    [adminHash]
  );
  console.log('  <ctrl94>tag> Admin user seeded. (ID: admin / Pass: admin123)');

  // ── TEACHERS ───────────────────────────────────────────────────────
  const teacherNames = [
    'Rajesh Kumar','Priya Sharma','Alok Dixit','Sumita Roy','Anita Vyas',
    'Pavan Gupta','Mary L.','Gopal Varma','Shanthi R.','Wilson Joseph',
    'Kavitha M.','Devendra Shah','Meera Nair','Rahul Sen','Neha Patil',
    'Sandeep Joshi','Vikram Singh','Sanjay Rawat','Manoj Pandey','Deepak Verma',
    'Divya Nair','Ritu Kapur'
  ];

  const teacherHash = await bcrypt.hash('teach123', SALT_ROUNDS);

  for (let i = 0; i < classList.length; i++) {
    const tId   = 'TCH' + String(i + 1).padStart(3, '0');
    const tName = teacherNames[i % teacherNames.length];
    const dept  = classList[i].name.includes('LKG') || classList[i].name.includes('UKG')
                  ? 'Pre-Primary'
                  : classList[i].name.includes('Standard') && parseInt(classList[i].name) < 6
                    ? 'Primary' : 'High School';

    const uRes = await client.query(
      `INSERT INTO users (user_id, password, role, name)
       VALUES ($1, $2, 'teacher', $3)
       ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [tId, teacherHash, tName]
    );
    const uId = uRes.rows[0].id;

    await client.query(
      `INSERT INTO teachers (teacher_id, user_id, name, department, subjects, phone, class_assigned, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Full-Time')
       ON CONFLICT (teacher_id) DO NOTHING`,
      [tId, uId, tName, dept, 'Mathematics & Science',
       '+91 944' + String(1000000 + i * 24391), classList[i].name]
    );
  }
  console.log(`  ✅ ${classList.length} teachers seeded. (Pass: teach123)`);

  // ── STUDENTS & PARENTS ─────────────────────────────────────────────
  const firstNames = ['Aditya','Pooja','Rohan','Sneha','Amit','Karan','Vijay','Rahul','Priya','Anjali',
    'Arjun','Neha','Divya','Sandeep','Vikram','Manoj','Ritu','Meena','Kiran','Deepika',
    'Karthik','Suresh','Manish','Jyoti','Shweta','Abhishek','Harish','Preeti','Swati','Anil',
    'Nikhil','Pankaj','Aarti','Siddharth','Nisha','Ravi','Simran','Varun','Komal','Tushar','Riya'];
  const lastNames  = ['Patel','Sharma','Gupta','Roy','Shah','Varma','Kumar','Singh','Nair','Sen',
    'Patil','Joshi','Iyer','Pillai','Rao','Reddy','Chawla','Mehta','Bose','Das',
    'Mishra','Pandey','Trivedi','Chatterjee','Mukherjee','Banerjee','Saxena','Kapoor',
    'Khanna','Malhotra','Verma','Yadav','Prasad','Choudhury','Dutta','Grover','Sood','Gill'];

  const studentHash = await bcrypt.hash('stud123', SALT_ROUNDS);
  const parentHash  = await bcrypt.hash('par123', SALT_ROUNDS);

  let stuIndex = 1;
  const feeStatuses = ['Paid', 'Partial', 'Unpaid'];

  // Seed only first 5 students per class to keep it manageable (can expand)
  const STUDENTS_PER_CLASS = 5;

  for (let cIdx = 0; cIdx < classList.length; cIdx++) {
    const cls = classList[cIdx];
    for (let i = 0; i < STUDENTS_PER_CLASS; i++) {
      const sId    = 'STU' + String(stuIndex).padStart(3, '0');
      const pId    = 'PAR' + String(stuIndex).padStart(3, '0');
      const fName  = firstNames[(stuIndex - 1) % firstNames.length];
      const lName  = lastNames[(i + stuIndex) % lastNames.length];
      const sName  = fName + ' ' + lName;
      const sec    = cls.sections[i % cls.sections.length];
      const fee    = feeStatuses[stuIndex % 3];
      const att    = Math.floor(Math.random() * 22) + 78;
      const phone  = '+91 9' + String(800000000 + stuIndex * 1111);

      // Student user
      const suRes = await client.query(
        `INSERT INTO users (user_id, password, role, name)
         VALUES ($1, $2, 'student', $3)
         ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [sId, studentHash, sName]
      );
      const suId = suRes.rows[0].id;

      // Student record
      const stRes = await client.query(
        `INSERT INTO students (student_id, user_id, name, class_name, section, phone, attendance_pct, fee_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (student_id) DO NOTHING
         RETURNING id`,
        [sId, suId, sName, cls.name, sec, phone, att, fee]
      );

      if (stRes.rows.length > 0) {
        const stDbId = stRes.rows[0].id;

        // Parent name
        const pFName = firstNames[(stuIndex + i + 10) % firstNames.length];
        const pName  = pFName + ' ' + lName;

        // Parent user
        const puRes = await client.query(
          `INSERT INTO users (user_id, password, role, name)
           VALUES ($1, $2, 'parent', $3)
           ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [pId, parentHash, pName]
        );
        const puId = puRes.rows[0].id;

        // Parent record
        await client.query(
          `INSERT INTO parents (parent_id, user_id, student_id, name, phone, email)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (parent_id) DO NOTHING`,
          [pId, puId, stDbId, pName, phone, pFName.toLowerCase() + '.' + lName.toLowerCase() + '@example.com']
        );

        // Fee record
        const amtDue = 25000;
        const amtPaid = fee === 'Paid' ? amtDue : fee === 'Partial' ? 12500 : 0;
        await client.query(
          `INSERT INTO fees (student_id, academic_year, term, amount_due, amount_paid, status)
           VALUES ($1, '2026-2027', 'Annual', $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [stDbId, amtDue, amtPaid, fee]
        );
      }

      stuIndex++;
    }
  }
  console.log(`  ✅ ${stuIndex - 1} students seeded. (Pass: stud123)`);
  console.log(`  ✅ ${stuIndex - 1} parents seeded. (Pass: par123)`);

  // ── SUBJECTS ───────────────────────────────────────────────────────
  const subjectMap = {
    'LKG':  ['Rhymes & Singing','Alphabet Writing','Drawing & Coloring','Numbers & Counting','Storytelling'],
    'UKG':  ['Phonics','Number Work','Drawing','Environmental Studies','Story Time'],
    'default': ['Mathematics','Science','English Language','Social Science','Hindi Language','Computer Science'],
    '11th Standard - Computer Science with Mathematics': ['Mathematics','Physics','Chemistry','English Language','Computer Science'],
    '11th Standard - Biology with Mathematics':          ['Mathematics','Physics','Chemistry','English Language','Biology'],
    '11th Standard - Pure Science':                      ['Physics','Chemistry','Biology','English Language','Zoology & Botany'],
    '11th Standard - Commerce with Computer Application': ['Accountancy','Business Studies','Economics','English Language','Computer Application'],
    '11th Standard - Commerce with Business Maths':      ['Accountancy','Business Studies','Economics','English Language','Business Mathematics'],
  };

  for (let cIdx = 0; cIdx < classList.length; cIdx++) {
    const cls      = classList[cIdx];
    const tId      = 'TCH' + String(cIdx + 1).padStart(3, '0');
    const subNames = subjectMap[cls.name] ||
                     subjectMap[cls.name.replace('12th', '11th')] ||
                     subjectMap.default;

    for (let sIdx = 0; sIdx < subNames.length; sIdx++) {
      const code = cls.name.substring(0, 3).toUpperCase().replace(/ /g,'') + '_' + sIdx + '01';
      await client.query(
        `INSERT INTO subjects (code, name, class_name, teacher_id, periods_week, type)
         VALUES ($1, $2, $3, $4, 5, 'Core')
         ON CONFLICT (code) DO NOTHING`,
        [code, subNames[sIdx], cls.name, tId]
      );
    }
  }
  console.log(`  ✅ Subjects seeded for all classes.`);

  // ── NOTICES ────────────────────────────────────────────────────────
  const notices = [
    'Welcome to AMALA HSS EduSphere Portal — Academic Year 2026-2027',
    'Annual Day celebrations scheduled for 15th July 2026',
    'Quarterly examinations for 10th Standard begin 18th June 2026',
    'Parent-Teacher Meeting on 30th June 2026 at 10:00 AM',
    'School will remain closed on 20th June for school annual sports day',
  ];
  for (const msg of notices) {
    await client.query(
      `INSERT INTO notices (message, posted_by) VALUES ($1, 'Administration')`,
      [msg]
    );
  }
  console.log(`  ✅ ${notices.length} notices seeded.`);

  // ── SAMPLE ASSIGNMENT ──────────────────────────────────────────────
  await client.query(
    `INSERT INTO assignments (asn_id, title, class_name, section, subject, due_date, max_marks, instructions, teacher_id)
     VALUES ('ASN001', 'Quadratic Equations Practice', '10th Standard', 'A', 'Mathematics', CURRENT_DATE + 7, 50, 'Solve all exercises from Chapter 4 — Section 4.2', 'TCH012')
     ON CONFLICT (asn_id) DO NOTHING`
  );
  console.log('  ✅ Sample assignment seeded.');

  // ── TIMETABLE (Sample for 10th Standard A) ─────────────────────────
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
  const timetableSubjects = ['Mathematics','Science','English Language','Social Science','Hindi Language','Computer Science'];
  for (let dIdx = 0; dIdx < days.length; dIdx++) {
    for (let p = 1; p <= 6; p++) {
      await client.query(
        `INSERT INTO timetable (class_name, section, day, period, subject, teacher_id, start_time, end_time)
         VALUES ('10th Standard', 'A', $1, $2, $3, 'TCH012', $4, $5)
         ON CONFLICT DO NOTHING`,
        [days[dIdx], p, timetableSubjects[(dIdx + p) % timetableSubjects.length],
         `${7 + p}:00`, `${8 + p}:00`]
      );
    }
  }
  console.log('  ✅ Sample timetable seeded for 10th Standard A.');

  // ── SAMPLE RESULTS (for STU001 - Aditya Patel) ────────────────────
  const stu001 = await client.query(`SELECT id FROM students WHERE student_id = 'STU001'`);
  if (stu001.rows.length > 0) {
    const sDbId = stu001.rows[0].id;
    const resultsToSeed = [
      // Quarterly Exam
      { subject: 'Mathematics', exam: 'Quarterly Examination', max: 100, obt: 95, gr: 'A+', rem: 'Excellent analytical skills' },
      { subject: 'Science', exam: 'Quarterly Examination', max: 100, obt: 92, gr: 'A+', rem: 'Outstanding lab work and theory' },
      { subject: 'English Language', exam: 'Quarterly Examination', max: 100, obt: 88, gr: 'A', rem: 'Good communication and vocabulary' },
      { subject: 'Social Science', exam: 'Quarterly Examination', max: 100, obt: 85, gr: 'A', rem: 'Strong grasp of history and geography' },
      { subject: 'Computer Science', exam: 'Quarterly Examination', max: 100, obt: 98, gr: 'A+', rem: 'Exceptional programming logic' },
      
      // Unit Test 1 (for CIA)
      { subject: 'Mathematics', exam: 'Unit Test 1', max: 20, obt: 19, gr: 'A+', rem: 'Great start' },
      { subject: 'Science', exam: 'Unit Test 1', max: 20, obt: 18, gr: 'A', rem: 'Well done' },
      { subject: 'English Language', exam: 'Unit Test 1', max: 20, obt: 17, gr: 'A', rem: 'Good job' },
      { subject: 'Social Science', exam: 'Unit Test 1', max: 20, obt: 16, gr: 'B+', rem: 'Satisfactory' },
      { subject: 'Computer Science', exam: 'Unit Test 1', max: 20, obt: 20, gr: 'A+', rem: 'Perfect score' },

      // Unit Test 2 (for CIA)
      { subject: 'Mathematics', exam: 'Unit Test 2', max: 20, obt: 20, gr: 'A+', rem: 'Perfect score' },
      { subject: 'Science', exam: 'Unit Test 2', max: 20, obt: 19, gr: 'A+', rem: 'Very good' },
      { subject: 'English Language', exam: 'Unit Test 2', max: 20, obt: 18, gr: 'A', rem: 'Well done' },
      { subject: 'Social Science', exam: 'Unit Test 2', max: 20, obt: 17, gr: 'A', rem: 'Improved performance' },
      { subject: 'Computer Science', exam: 'Unit Test 2', max: 20, obt: 20, gr: 'A+', rem: 'Perfect score' },

      // Model Exam (for CIA)
      { subject: 'Mathematics', exam: 'Model Exam', max: 40, obt: 38, gr: 'A+', rem: 'Superb readiness' },
      { subject: 'Science', exam: 'Model Exam', max: 40, obt: 36, gr: 'A+', rem: 'Strong theory comprehension' },
      { subject: 'English Language', exam: 'Model Exam', max: 40, obt: 35, gr: 'A', rem: 'Good essay writing' },
      { subject: 'Social Science', exam: 'Model Exam', max: 40, obt: 34, gr: 'A', rem: 'Consistent' },
      { subject: 'Computer Science', exam: 'Model Exam', max: 40, obt: 39, gr: 'A+', rem: 'Flawless coding' },

      // Assignment (for CIA)
      { subject: 'Mathematics', exam: 'Assignment', max: 10, obt: 10, gr: 'A+', rem: 'Neat submission' },
      { subject: 'Science', exam: 'Assignment', max: 10, obt: 9, gr: 'A', rem: 'Well researched' },
      { subject: 'English Language', exam: 'Assignment', max: 10, obt: 9, gr: 'A', rem: 'Creative write-up' },
      { subject: 'Social Science', exam: 'Assignment', max: 10, obt: 8, gr: 'B+', rem: 'Timely' },
      { subject: 'Computer Science', exam: 'Assignment', max: 10, obt: 10, gr: 'A+', rem: 'Well documented code' },

      // Attendance score (for CIA)
      { subject: 'Mathematics', exam: 'Attendance', max: 10, obt: 10, gr: 'A+', rem: '100% attendance' },
      { subject: 'Science', exam: 'Attendance', max: 10, obt: 10, gr: 'A+', rem: '100% attendance' },
      { subject: 'English Language', exam: 'Attendance', max: 10, obt: 9, gr: 'A', rem: '90% attendance' },
      { subject: 'Social Science', exam: 'Attendance', max: 10, obt: 9, gr: 'A', rem: '90% attendance' },
      { subject: 'Computer Science', exam: 'Attendance', max: 10, obt: 10, gr: 'A+', rem: '100% attendance' }
    ];

    for (const r of resultsToSeed) {
      await client.query(
        `INSERT INTO results (student_id, subject, exam_name, max_marks, obtained, grade, remarks, published_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'TCH012')`,
        [sDbId, r.subject, r.exam, r.max, r.obt, r.gr, r.rem]
      );
    }
    console.log('  ✅ Sample results seeded for STU001.');
  }

  // ── SAMPLE EXAMS ──────────────────────────────────────────────────
  await client.query(
    `INSERT INTO exams (exam_id, title, class_name, section, subject, exam_type, exam_date, max_marks, duration_mins, teacher_id, status)
     VALUES 
       ('EXM001', 'Unit Test I', '10th Standard', 'A', 'Mathematics', 'Unit Test', CURRENT_DATE + 3, 50, 60, 'TCH012', 'Scheduled'),
       ('EXM002', 'Quarterly Chemistry Exam', '10th Standard', 'A', 'Science', 'Quarterly', CURRENT_DATE + 5, 100, 180, 'TCH012', 'Scheduled')
     ON CONFLICT (exam_id) DO NOTHING`
  );
  console.log('  ✅ Sample exams seeded.');

  console.log('\n🎉 Database seeded successfully!\n');
}

async function main() {
  console.log('\n🚀 EduSphere LMS — Database Setup\n');
  console.log(`   Host:     ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  console.log(`   Database: ${DB_NAME}`);
  console.log(`   User:     ${DB_CONFIG.user}\n`);

  try {
    await createDatabase();

    const client = new Client({ ...DB_CONFIG, database: DB_NAME });
    await client.connect();
    console.log('✅ Connected to database.');

    await runSchema(client);
    await seedData(client);
    await client.end();

    console.log('\n═══════════════════════════════════════');
    console.log('  ✅ DATABASE SETUP COMPLETE!');
    console.log('═══════════════════════════════════════\n');
  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    process.exit(1);
  }
}

main();
