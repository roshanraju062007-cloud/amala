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
