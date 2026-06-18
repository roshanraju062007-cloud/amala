/**
 * EduSphere LMS — Database Reset Script (with PG lifecycle management)
 * Starts embedded PostgreSQL, drops the existing database, recreates it, seeds the default admin user, and stops PostgreSQL.
 * Run: node database/reset_with_pg.js
 */
require('dotenv').config();
const EmbeddedPostgres = require('embedded-postgres').default;
const { Client } = require('pg');
const bcrypt     = require('bcryptjs');
const fs         = require('fs');
const path       = require('path');

const DB_PORT = parseInt(process.env.DB_PORT) || 5432;
const DB_NAME = process.env.DB_NAME || 'edusphere_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

async function main() {
  console.log('\n⏳ Starting embedded PostgreSQL for database reset...');
  const pg = new EmbeddedPostgres({
    databaseDir: path.join(__dirname, '../.pgdata'),
    user:        DB_USER,
    password:    DB_PASSWORD,
    port:        DB_PORT,
    persistent:  true,
  });

  try {
    const pgVersionExists = fs.existsSync(path.join(__dirname, '../.pgdata', 'PG_VERSION'));
    if (!pgVersionExists) {
      console.log('⏳ Initialising embedded PostgreSQL...');
      await pg.initialise();
    }
    await pg.start();
    console.log(`✅ PostgreSQL started on port ${DB_PORT}`);

    console.log('\n🔥 DELETING AND RESETTING DATABASE...\n');

    // Step 1: Connect to postgres database to drop and recreate DB_NAME
    const clientPG = new Client({
      host:     'localhost',
      port:     DB_PORT,
      user:     DB_USER,
      password: DB_PASSWORD,
      database: 'postgres',
    });

    await clientPG.connect();
    
    console.log(`⏳ Terminating active connections to "${DB_NAME}"...`);
    try {
      await clientPG.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
      `, [DB_NAME]);
    } catch (e) {
      console.log('⚠️ Could not terminate connections. Proceeding...');
    }

    console.log(`⏳ Dropping database "${DB_NAME}"...`);
    await clientPG.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
    console.log(`✅ Database "${DB_NAME}" dropped.`);

    console.log(`⏳ Creating database "${DB_NAME}"...`);
    await clientPG.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`✅ Database "${DB_NAME}" created.`);
    await clientPG.end();

    // Step 2: Connect to the new database and run schema + admin user
    const clientDB = new Client({
      host:     'localhost',
      port:     DB_PORT,
      user:     DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    await clientDB.connect();
    console.log('✅ Connected to newly created database.');

    // Run schema
    console.log('⏳ Applying database schema...');
    let schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    schema = schema.replace(/[^\x00-\x7F]/g, '-');
    await clientDB.query(schema);
    console.log('✅ Schema applied (all tables created).');

    // Seed admin user
    console.log('⏳ Seeding admin user...');
    const SALT_ROUNDS = 10;
    const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    await clientDB.query(
      `INSERT INTO users (user_id, password, role, name, email)
       VALUES ('admin', $1, 'admin', 'Administrator', 'admin@amalahss.edu.in')`,
      [adminHash]
    );
    console.log('✅ Admin user created.');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    await clientDB.end();

    console.log('\n🎉 Database reset complete! It is now clean and empty.');
  } catch (err) {
    console.error('❌ Reset failed:', err);
  } finally {
    try {
      console.log('⏳ Stopping PostgreSQL...');
      await pg.stop();
      console.log('✅ PostgreSQL stopped.');
    } catch (e) {
      console.error('⚠️ Error stopping PG:', e.message);
    }
  }
}

main();
