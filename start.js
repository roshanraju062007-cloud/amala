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
const USE_EXTERNAL_DB = Boolean((process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '').trim());

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  EduSphere LMS — Starting with ${USE_EXTERNAL_DB ? 'Supabase/Remote PG' : 'Embedded PG'}  ║`);
  console.log('╚══════════════════════════════════════════════════╝\n');

  let pg = null;

  try {
    if (!USE_EXTERNAL_DB) {
      // Step 1: Start embedded PostgreSQL
      pg = new EmbeddedPostgres({
        databaseDir: path.join(__dirname, '.pgdata'),
        user:        process.env.DB_USER || 'postgres',
        password:    process.env.DB_PASSWORD || 'postgres',
        port:        PG_PORT,
        persistent:  true,
      });

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
    } else {
      console.log('✅ Using external Supabase/hosted PostgreSQL via DATABASE_URL');
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
      const adminHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO users (user_id, password, raw_password, role, name, email) VALUES ('admin', $1, 'admin123', 'admin', 'Administrator', 'admin@amalahss.edu.in') ON CONFLICT DO NOTHING`,
        [adminHash]
      );
      console.log('✅ Admin user created (ID: admin / Pass: admin123)');

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
        await pool.query(
          `INSERT INTO classes (name, sections, students_count)
           VALUES ($1, $2, $3)
           ON CONFLICT (name) DO NOTHING`,
          [cls.name, cls.sections, 40]
        );
      }
      console.log(`✅ ${classList.length} classes seeded.`);

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
          await pool.query(
            `INSERT INTO subjects (code, name, class_name, teacher_id, periods_week, type)
             VALUES ($1, $2, $3, NULL, 5, 'Core')
             ON CONFLICT (code) DO NOTHING`,
            [code, subNames[sIdx], cls.name]
          );
        }
      }
      console.log(`✅ Subjects seeded for all classes.`);
    } else {
      console.log('✅ Database schema already exists');
    }

  } catch (pgErr) {
    console.error('\n⚠️  Embedded PG failed:', pgErr ? pgErr.message || pgErr : 'Unknown error');
    if (!USE_EXTERNAL_DB) {
      console.log(`   Trying to connect to system PostgreSQL on port ${PG_PORT}...\n`);
    }
    // Fall through to start server anyway
  }

  // Step 3: Start Express server
  require('./backend/server');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    try { if (pg) await pg.stop(); } catch (e) {}
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Startup error:', err);
  // Start server anyway
  require('./backend/server');
});
