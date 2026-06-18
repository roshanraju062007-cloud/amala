/**
 * EduSphere LMS — Database Cleanup Script
 * Clears all demo data (classes, teachers, students, parents, timetable, notices, etc.)
 * and keeps only the admin account.
 * Run: node database/cleanup.js
 */
require('dotenv').config();
const { Client } = require('pg');

const DB_CONFIG = {
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5433,
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'edusphere_db',
};

async function main() {
  console.log('\n🧹 Cleaning up all demo data from PostgreSQL...\n');
  const client = new Client(DB_CONFIG);
  try {
    await client.connect();
    
    console.log('⏳ Truncating tables...');
    await client.query('TRUNCATE TABLE timetable CASCADE');
    await client.query('TRUNCATE TABLE materials CASCADE');
    await client.query('TRUNCATE TABLE notices CASCADE');
    await client.query('TRUNCATE TABLE results CASCADE');
    await client.query('TRUNCATE TABLE submissions CASCADE');
    await client.query('TRUNCATE TABLE assignments CASCADE');
    await client.query('TRUNCATE TABLE attendance CASCADE');
    await client.query('TRUNCATE TABLE fees CASCADE');
    await client.query('TRUNCATE TABLE subjects CASCADE');
    await client.query('TRUNCATE TABLE parents CASCADE');
    await client.query('TRUNCATE TABLE students CASCADE');
    await client.query('TRUNCATE TABLE teachers CASCADE');
    await client.query('TRUNCATE TABLE classes CASCADE');
    
    console.log('⏳ Removing demo users...');
    await client.query("DELETE FROM users WHERE user_id != 'admin'");
    
    console.log('✅ Clean up complete! Only the admin user remains.');
    console.log('   Admin ID:       admin');
    console.log('   Admin Password: admin123\n');
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
  } finally {
    await client.end();
  }
}

main();
