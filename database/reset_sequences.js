/**
 * EduSphere LMS — Reset Database Sequences & Tables
 * Wipes all tables, resets auto-increment sequences, and seeds default classes.
 * Run: node database/reset_sequences.js
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

async function main() {
  console.log('\n🧹 Complete Database Reset & Sequence Synchronization...\n');
  const client = new Client(DB_CONFIG);
  try {
    await client.connect();

    // Disable RLS temporarily to perform cleanup
    console.log('⏳ Disabling Row-Level Security temporarily...');
    const tables = [
      'timetable', 'materials', 'notices', 'results', 'submissions', 
      'assignments', 'attendance', 'fees', 'subjects', 'parents', 
      'students', 'teachers', 'classes', 'users'
    ];
    for (const table of tables) {
      await client.query(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`);
    }

    console.log('⏳ Truncating tables with RESTART IDENTITY...');
    const tablesToTruncate = tables.filter(t => t !== 'users');
    // Truncate other tables and restart identity
    await client.query(`TRUNCATE TABLE ${tablesToTruncate.join(', ')} RESTART IDENTITY CASCADE`);

    console.log('⏳ Cleaning users table...');
    await client.query("DELETE FROM users WHERE user_id != 'admin'");
    
    // Ensure admin user has ID = 1
    await client.query("UPDATE users SET id = 1 WHERE user_id = 'admin'");
    
    console.log('⏳ Resetting users table primary key sequence...');
    await client.query("ALTER SEQUENCE users_id_seq RESTART WITH 2");

    console.log('⏳ Seeding classes...');
    for (const cls of classList) {
      await client.query(
        `INSERT INTO classes (name, sections, students_count)
         VALUES ($1, $2, $3)`,
        [cls.name, cls.sections, 0]
      );
    }

    // Re-enable RLS
    console.log('⏳ Re-enabling Row-Level Security...');
    for (const table of tables) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    }

    console.log('\n✅ Database tables fully cleaned and primary keys reset!');
    console.log('   All auto-incrementing IDs will now start at 1.');
    console.log('   Admin User ID: admin (DB ID: 1)\n');

  } catch (err) {
    console.error('❌ Reset failed:', err.message);
  } finally {
    await client.end();
  }
}

main();
