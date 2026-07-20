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

const databaseUrl = (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '').trim();
const useExternalDb = Boolean(databaseUrl);

const DB_CONFIG = {
  ...(useExternalDb
    ? {
        connectionString: databaseUrl,
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      }
    : {
        host:     process.env.DB_HOST || 'localhost',
        port:     parseInt(process.env.DB_PORT) || 5432,
        user:     process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      }),
};
const DB_NAME = process.env.DB_NAME || 'edusphere_db';

async function createDatabase() {
  if (useExternalDb) {
    console.log('ℹ️  DATABASE_URL detected — skipping database creation step.');
    return;
  }

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
    `INSERT INTO users (user_id, password, raw_password, role, name, email)
     VALUES ('admin', $1, 'admin123', 'admin', 'Administrator', 'admin@amalahss.edu.in')
     ON CONFLICT (user_id) DO NOTHING`,
    [adminHash]
  );
  console.log('  ✅ Admin user seeded. (ID: admin / Pass: admin123)');

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
    const subNames = subjectMap[cls.name] ||
                     subjectMap[cls.name.replace('12th', '11th')] ||
                     subjectMap.default;

    for (let sIdx = 0; sIdx < subNames.length; sIdx++) {
      const code = cls.name.substring(0, 3).toUpperCase().replace(/ /g,'') + '_' + sIdx + '01';
      await client.query(
        `INSERT INTO subjects (code, name, class_name, teacher_id, periods_week, type)
         VALUES ($1, $2, $3, NULL, 5, 'Core')
         ON CONFLICT (code) DO NOTHING`,
        [code, subNames[sIdx], cls.name]
      );
    }
  }
  console.log(`  ✅ Subjects seeded for all classes.`);
  console.log('\n🎉 Database seeded successfully!\n');
}

async function main() {
  console.log('\n🚀 EduSphere LMS — Database Setup\n');
  if (useExternalDb) {
    console.log('   Mode:     Supabase / hosted PostgreSQL');
    console.log(`   Source:   ${databaseUrl.replace(/:[^:@/]+@/, ':***@')}`);
  } else {
    console.log(`   Host:     ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   User:     ${DB_CONFIG.user}\n`);
  }

  try {
    await createDatabase();

    const client = useExternalDb
      ? new Client(DB_CONFIG)
      : new Client({ ...DB_CONFIG, database: DB_NAME });
    await client.connect();
    console.log('✅ Connected to database.');

    await runSchema(client);
    await seedData(client);
    
    // Run safe migrations for new columns (idempotent)
    const migrations = [
      `ALTER TABLE teachers ADD COLUMN IF NOT EXISTS email VARCHAR(150)`,
      `ALTER TABLE teachers ADD COLUMN IF NOT EXISTS address TEXT`,
      `ALTER TABLE teachers ADD COLUMN IF NOT EXISTS date_joined DATE`,
      `ALTER TABLE teachers ADD COLUMN IF NOT EXISTS date_of_birth DATE`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS roll_number VARCHAR(20)`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(10)`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT`,
      `ALTER TABLE timetable ADD COLUMN IF NOT EXISTS room_number VARCHAR(20)`,
      `ALTER TABLE notices ADD COLUMN IF NOT EXISTS title VARCHAR(200)`,
      `ALTER TABLE notices ADD COLUMN IF NOT EXISTS target_audience VARCHAR(20) DEFAULT 'all'`,
    ];
    for (const sql of migrations) {
      try { await client.query(sql); } catch (e) { /* column may already exist */ }
    }
    console.log('  ✅ Schema migrations applied.');
    
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
