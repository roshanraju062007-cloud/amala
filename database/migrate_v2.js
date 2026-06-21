/**
 * EduSphere LMS — Database Migration v2
 * Runs CREATE TABLE IF NOT EXISTS statements to add missing tables (library, transport, settings).
 * Run: node database/migrate_v2.js
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

const migrationSql = `
CREATE TABLE IF NOT EXISTS library_books (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(30) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(150),
  total_copies INT DEFAULT 1,
  available_copies INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_issues (
  id SERIAL PRIMARY KEY,
  isbn VARCHAR(30) REFERENCES library_books(isbn) ON DELETE CASCADE,
  student_id VARCHAR(20) NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  return_date DATE,
  status VARCHAR(20) DEFAULT 'issued'
);

CREATE TABLE IF NOT EXISTS transport_vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_no VARCHAR(20) UNIQUE NOT NULL,
  route_name VARCHAR(150),
  driver_name VARCHAR(100),
  driver_phone VARCHAR(20),
  capacity INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_assignments (
  id SERIAL PRIMARY KEY,
  vehicle_id INT REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  student_id VARCHAR(20) NOT NULL,
  pickup_point VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT
);

-- Enable RLS
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

ALTER TABLE library_books FORCE ROW LEVEL SECURITY;
ALTER TABLE library_issues FORCE ROW LEVEL SECURITY;
ALTER TABLE transport_vehicles FORCE ROW LEVEL SECURITY;
ALTER TABLE transport_assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE settings FORCE ROW LEVEL SECURITY;

-- Grant privileges to app role (ignore errors if role doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'edusphere_app') THEN
    GRANT ALL PRIVILEGES ON TABLE library_books, library_issues, transport_vehicles, transport_assignments, settings TO edusphere_app;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO edusphere_app;
  END IF;
END
$$;

-- RLS Policies (drop if exist, then create)
DROP POLICY IF EXISTS library_books_select ON library_books;
CREATE POLICY library_books_select ON library_books FOR SELECT TO edusphere_app USING (true);
DROP POLICY IF EXISTS library_books_admin ON library_books;
CREATE POLICY library_books_admin ON library_books FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');

DROP POLICY IF EXISTS library_issues_admin ON library_issues;
CREATE POLICY library_issues_admin ON library_issues FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');
DROP POLICY IF EXISTS library_issues_student ON library_issues;
CREATE POLICY library_issues_student ON library_issues FOR SELECT TO edusphere_app USING (student_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS transport_vehicles_select ON transport_vehicles;
CREATE POLICY transport_vehicles_select ON transport_vehicles FOR SELECT TO edusphere_app USING (true);
DROP POLICY IF EXISTS transport_vehicles_admin ON transport_vehicles;
CREATE POLICY transport_vehicles_admin ON transport_vehicles FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');

DROP POLICY IF EXISTS transport_assignments_admin ON transport_assignments;
CREATE POLICY transport_assignments_admin ON transport_assignments FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');
DROP POLICY IF EXISTS transport_assignments_student ON transport_assignments;
CREATE POLICY transport_assignments_student ON transport_assignments FOR SELECT TO edusphere_app USING (student_id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS settings_select ON settings;
CREATE POLICY settings_select ON settings FOR SELECT TO edusphere_app USING (true);
DROP POLICY IF EXISTS settings_admin ON settings;
CREATE POLICY settings_admin ON settings FOR ALL TO edusphere_app USING (current_setting('app.current_user_role', true) = 'admin');
`;

async function main() {
  console.log('⏳ Running v2 migration script...');
  const client = new Client(DB_CONFIG);
  try {
    await client.connect();
    await client.query(migrationSql);
    console.log('✅ Migration v2 applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
