/**
 * EduSphere LMS — Migration v3: Add exams + messages tables
 * Run: node database/migrate_v3.js
 */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME || 'edusphere_db',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function migrate() {
  const client = await pool.connect();
  console.log('Connected to database');

  try {
    await client.query('BEGIN');

    // EXAMS TABLE
    await client.query(`
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
      )
    `);
    console.log('exams table created/verified');

    // MESSAGES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id          SERIAL PRIMARY KEY,
        sender_id   VARCHAR(30) NOT NULL,
        receiver_id VARCHAR(30) NOT NULL,
        room_id     VARCHAR(100) NOT NULL,
        content     TEXT NOT NULL,
        sent_at     TIMESTAMP DEFAULT NOW(),
        is_read     BOOLEAN DEFAULT FALSE
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id)`);
    console.log('messages table created/verified');

    // GRANT PRIVILEGES
    try {
      await client.query(`GRANT ALL PRIVILEGES ON TABLE exams TO edusphere_app`);
      await client.query(`GRANT ALL PRIVILEGES ON TABLE messages TO edusphere_app`);
      await client.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO edusphere_app`);
    } catch (e) {
      console.log('GRANT skipped (using postgres superuser):', e.message);
    }

    // ENABLE RLS
    try {
      await client.query(`ALTER TABLE exams ENABLE ROW LEVEL SECURITY`);
      await client.query(`ALTER TABLE exams FORCE ROW LEVEL SECURITY`);
      await client.query(`ALTER TABLE messages ENABLE ROW LEVEL SECURITY`);
      await client.query(`ALTER TABLE messages FORCE ROW LEVEL SECURITY`);
    } catch (e) {
      console.log('RLS enable note:', e.message);
    }

    // DROP OLD POLICIES (safe re-run)
    const drops = [
      'DROP POLICY IF EXISTS exams_admin_all ON exams',
      'DROP POLICY IF EXISTS exams_teacher_own ON exams',
      'DROP POLICY IF EXISTS exams_student_class ON exams',
      'DROP POLICY IF EXISTS exams_parent_class ON exams',
      'DROP POLICY IF EXISTS messages_own ON messages',
      'DROP POLICY IF EXISTS messages_admin ON messages',
    ];
    for (const sql of drops) {
      try { await client.query(sql); } catch (e) {}
    }

    // EXAMS RLS POLICIES
    await client.query(`
      CREATE POLICY exams_admin_all ON exams FOR ALL TO edusphere_app
        USING (current_setting('app.current_user_role', true) = 'admin')
        WITH CHECK (current_setting('app.current_user_role', true) = 'admin')
    `);
    await client.query(`
      CREATE POLICY exams_teacher_own ON exams FOR ALL TO edusphere_app
        USING (current_setting('app.current_user_role', true) = 'teacher')
        WITH CHECK (current_setting('app.current_user_role', true) = 'teacher')
    `);
    await client.query(`
      CREATE POLICY exams_student_class ON exams FOR SELECT TO edusphere_app
        USING (
          current_setting('app.current_user_role', true) = 'student' AND
          (class_name IS NULL OR class_name = (
            SELECT class_name FROM students
            WHERE user_id = NULLIF(current_setting('app.current_db_id', true),'')::int
          ))
        )
    `);
    await client.query(`
      CREATE POLICY exams_parent_class ON exams FOR SELECT TO edusphere_app
        USING (
          current_setting('app.current_user_role', true) = 'parent' AND
          (class_name IS NULL OR class_name = (
            SELECT class_name FROM students WHERE id = (
              SELECT student_id FROM parents
              WHERE user_id = NULLIF(current_setting('app.current_db_id', true),'')::int
            )
          ))
        )
    `);
    console.log('exams RLS policies created');

    // MESSAGES RLS POLICIES
    await client.query(`
      CREATE POLICY messages_own ON messages FOR ALL TO edusphere_app
        USING (
          sender_id   = current_setting('app.current_user_id', true) OR
          receiver_id = current_setting('app.current_user_id', true)
        )
        WITH CHECK (
          sender_id = current_setting('app.current_user_id', true)
        )
    `);
    await client.query(`
      CREATE POLICY messages_admin ON messages FOR ALL TO edusphere_app
        USING (current_setting('app.current_user_role', true) = 'admin')
        WITH CHECK (current_setting('app.current_user_role', true) = 'admin')
    `);
    console.log('messages RLS policies created');

    await client.query('COMMIT');
    console.log('\nMigration v3 complete!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
