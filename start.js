/**
 * EduSphere LMS — Auto-Start Script with Embedded PostgreSQL
 * Starts bundled PostgreSQL server, then the Express server
 * Run: node start.js
 */
require('dotenv').config();
const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');

const DB_NAME = process.env.DB_NAME || 'edusphere_db';
const PG_PORT = parseInt(process.env.DB_PORT) || 5432;

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║     EduSphere LMS — Starting with Embedded PG   ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // Step 1: Start embedded PostgreSQL
  const pg = new EmbeddedPostgres({
    databaseDir: path.join(__dirname, '.pgdata'),
    user:        process.env.DB_USER || 'postgres',
    password:    process.env.DB_PASSWORD || 'postgres',
    port:        PG_PORT,
    persistent:  true,
  });

  try {
    const pgVersionExists = require('fs').existsSync(path.join(__dirname, '.pgdata', 'PG_VERSION'));
    if (!pgVersionExists) {
      console.log('⏳ Initialising embedded PostgreSQL...');
      await pg.initialise();
    }
    console.log('⏳ Starting embedded PostgreSQL...');
    await pg.start();
    console.log(`✅ PostgreSQL started on port ${PG_PORT}`);

    // Create database if it doesn't exist
    try {
      await pg.createDatabase(DB_NAME);
      console.log(`✅ Database "${DB_NAME}" ready`);
    } catch (dbCreateErr) {
      if (dbCreateErr && dbCreateErr.message && dbCreateErr.message.includes('already exists')) {
        console.log(`✅ Database "${DB_NAME}" already exists`);
      } else {
        throw dbCreateErr;
      }
    }

    // Step 2: Run schema + seed if first time
    const { pool } = require('./backend/db');
    const tableCheck = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='users'`
    );

    if (tableCheck.rows.length === 0) {
      console.log('\n📦 First run detected — setting up schema and seeding data...');
      // Import and run setup
      const fs   = require('fs');
      let schema = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
      schema = schema.replace(/[^\x00-\x7F]/g, '-');
      await pool.query(schema);
      console.log('✅ Schema created');

      // Run seeder
      const bcrypt = require('bcryptjs');
      // Minimal seed: just admin user
      const adminHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO users (user_id, password, role, name, email) VALUES ('admin', $1, 'admin', 'Administrator', 'admin@amalahss.edu.in') ON CONFLICT DO NOTHING`,
        [adminHash]
      );
      console.log('✅ Admin user created (ID: admin / Pass: admin123)');
      console.log('\n⚠️  Run "node database/setup.js" to seed all students, teachers, classes etc.\n');
    } else {
      console.log('✅ Database schema already exists');
    }

    // Seed minimal demo data if not already present
    try {
      const { Client } = require('pg');
      const seedClient = new Client({
        host:     process.env.DB_HOST || 'localhost',
        port:     PG_PORT,
        database: DB_NAME,
        user:     process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      });
      await seedClient.connect();

      const usersCheck = await seedClient.query(`SELECT 1 FROM users WHERE user_id IN ('TCH001', 'STU001', 'PAR001')`);
      if (usersCheck.rows.length < 3) {
        console.log('📦 Seeding minimal portal demo users...');
        const bcrypt = require('bcryptjs');
        const adminHash = await bcrypt.hash('admin123', 10);
        const teachHash = await bcrypt.hash('teach123', 10);
        const studHash = await bcrypt.hash('stud123', 10);
        const parHash = await bcrypt.hash('par123', 10);

        try {
          // Temporarily disable RLS for seeding
          await seedClient.query(`ALTER TABLE users DISABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE classes DISABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE teachers DISABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE students DISABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE parents DISABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE fees DISABLE ROW LEVEL SECURITY`);

          // Ensure admin user exists
          await seedClient.query(
            `INSERT INTO users (user_id, password, role, name, email)
             VALUES ('admin', $1, 'admin', 'Administrator', 'admin@amalahss.edu.in')
             ON CONFLICT (user_id) DO NOTHING`,
            [adminHash]
          );

          // Ensure class exists
          await seedClient.query(
            `INSERT INTO classes (name, sections)
             VALUES ('10th Standard', '{A,B,C,D}')
             ON CONFLICT (name) DO NOTHING`
          );

          // Seed teacher Priya Sharma
          const tUserRes = await seedClient.query(
            `INSERT INTO users (user_id, password, role, name)
             VALUES ('TCH001', $1, 'teacher', 'Priya Sharma')
             ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [teachHash]
          );
          const tUid = tUserRes.rows[0]?.id;
          if (tUid) {
            await seedClient.query(
              `INSERT INTO teachers (teacher_id, user_id, name, department, subjects, phone, class_assigned, status)
               VALUES ('TCH001', $1, 'Priya Sharma', 'High School', 'Mathematics & Science', '+91 9441000001', '10th Standard', 'Full-Time')
               ON CONFLICT (teacher_id) DO NOTHING`,
              [tUid]
            );
          }

          // Seed student Aditya Patel
          const sUserRes = await seedClient.query(
            `INSERT INTO users (user_id, password, role, name)
             VALUES ('STU001', $1, 'student', 'Aditya Patel')
             ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [studHash]
          );
          const sUid = sUserRes.rows[0]?.id;
          if (sUid) {
            const sRes = await seedClient.query(
              `INSERT INTO students (student_id, user_id, name, class_name, section, phone, attendance_pct, fee_status)
               VALUES ('STU001', $1, 'Aditya Patel', '10th Standard', 'A', '+91 9800000001', 98.50, 'Paid')
               ON CONFLICT (student_id) DO NOTHING
               RETURNING id`,
              [sUid]
            );
            const sDbId = sRes.rows[0]?.id || (await seedClient.query(`SELECT id FROM students WHERE student_id = 'STU001'`)).rows[0]?.id;

            if (sDbId) {
              // Seed parent Suresh Patel
              const pUserRes = await seedClient.query(
                `INSERT INTO users (user_id, password, role, name)
                 VALUES ('PAR001', $1, 'parent', 'Suresh Patel')
                 ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id`,
                [parHash]
              );
              const pUid = pUserRes.rows[0]?.id;
              if (pUid) {
                await seedClient.query(
                  `INSERT INTO parents (parent_id, user_id, student_id, name, phone, email)
                   VALUES ('PAR001', $1, $2, 'Suresh Patel', '+91 9800000001', 'suresh@example.com')
                   ON CONFLICT (parent_id) DO NOTHING`,
                  [pUid, sDbId]
                );
              }

              // Seed fee
              await seedClient.query(
                `INSERT INTO fees (student_id, academic_year, term, amount_due, amount_paid, status)
                 VALUES ($1, '2026-2027', 'Annual', 25000, 25000, 'Paid')
                 ON CONFLICT DO NOTHING`,
                [sDbId]
              );
            }
          }
          console.log('✅ Minimal portal demo users seeded.');
        } finally {
          // Re-enable RLS after seeding
          await seedClient.query(`ALTER TABLE users ENABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE classes ENABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE teachers ENABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE students ENABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE parents ENABLE ROW LEVEL SECURITY`);
          await seedClient.query(`ALTER TABLE fees ENABLE ROW LEVEL SECURITY`);
        }
      }
      await seedClient.end();
    } catch (seedErr) {
      console.error('⚠️ Seeding minimal portal users failed:', seedErr.message);
    }

  } catch (pgErr) {
    console.error('\n⚠️  Embedded PG failed:', pgErr ? pgErr.message || pgErr : 'Unknown error');
    console.log(`   Trying to connect to system PostgreSQL on port ${PG_PORT}...\n`);
    // Fall through to start server anyway
  }

  // Step 3: Start Express server
  require('./backend/server');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    try { await pg.stop(); } catch (e) {}
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Startup error:', err);
  // Start server anyway
  require('./backend/server');
});
