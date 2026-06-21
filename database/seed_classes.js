/**
 * EduSphere LMS — Class Seeding Script
 * Seeds standard classes (LKG to 12th Standard)
 * Run: node database/seed_classes.js
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
  console.log('\n📦 Seeding classes, library books, transport vehicles, and settings into edusphere_db...\n');
  const client = new Client(DB_CONFIG);
  try {
    await client.connect();

    // Disable RLS temporarily to insert seed records
    await client.query('ALTER TABLE classes DISABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE library_books DISABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE transport_vehicles DISABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE settings DISABLE ROW LEVEL SECURITY');

    // 1. Seed Classes
    for (const cls of classList) {
      await client.query(
        `INSERT INTO classes (name, sections, students_count)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO NOTHING`,
        [cls.name, cls.sections, 0]
      );
    }
    console.log(`✅ Seeded ${classList.length} classes.`);

    // 2. Seed Library Books
    const books = [
      { isbn: '978-0131103627', title: 'The C Programming Language', author: 'Brian W. Kernighan, Dennis M. Ritchie', total_copies: 5, available_copies: 5 },
      { isbn: '978-0201633610', title: 'Design Patterns', author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', total_copies: 3, available_copies: 3 },
      { isbn: '978-0132350884', title: 'Clean Code', author: 'Robert C. Martin', total_copies: 8, available_copies: 8 }
    ];
    for (const b of books) {
      await client.query(
        `INSERT INTO library_books (isbn, title, author, total_copies, available_copies)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (isbn) DO NOTHING`,
        [b.isbn, b.title, b.author, b.total_copies, b.available_copies]
      );
    }
    console.log(`✅ Seeded library books.`);

    // 3. Seed Transport Vehicles
    const vehicles = [
      { vehicle_no: 'KL-01-CA-1234', route_name: 'Route 1 | Gandhi Nagar | 8 Stops', driver_name: 'Murugan K.', driver_phone: '+919876543210', capacity: 40 },
      { vehicle_no: 'KL-01-CB-5678', route_name: 'Route 2 | Nehru Avenue | 6 Stops', driver_name: 'Raju S.', driver_phone: '+919876543211', capacity: 30 },
      { vehicle_no: 'KL-01-CC-9012', route_name: 'Route 3 | Temple Road | 10 Stops', driver_name: 'Saji P.', driver_phone: '+919876543212', capacity: 50 }
    ];
    for (const v of vehicles) {
      await client.query(
        `INSERT INTO transport_vehicles (vehicle_no, route_name, driver_name, driver_phone, capacity)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (vehicle_no) DO NOTHING`,
        [v.vehicle_no, v.route_name, v.driver_name, v.driver_phone, v.capacity]
      );
    }
    console.log(`✅ Seeded transport vehicles.`);

    // 4. Seed Settings
    const settings = {
      school_name: 'AMALA HIGHER SECONDARY SCHOOL',
      school_code: 'HSS-CBSE-3701',
      board: 'CBSE Board',
      medium: 'English',
      academic_year: '2026-2027'
    };
    for (const [k, val] of Object.entries(settings)) {
      await client.query(
        `INSERT INTO settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING`,
        [k, val]
      );
    }
    console.log(`✅ Seeded system settings.`);

    // Re-enable RLS
    await client.query('ALTER TABLE classes ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE library_books ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE transport_vehicles ENABLE ROW LEVEL SECURITY');
    await client.query('ALTER TABLE settings ENABLE ROW LEVEL SECURITY');

    console.log(`\n🎉 Seeding completed successfully.`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await client.end();
  }
}

main();
