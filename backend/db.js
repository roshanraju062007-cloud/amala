/* EduSphere LMS — PostgreSQL Database Connection Pool */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'edusphere_db',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  // console.log('PostgreSQL client connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

// Helper: run a query
const query = (text, params) => pool.query(text, params);

// Helper: get single row
const queryOne = async (text, params) => {
  const res = await pool.query(text, params);
  return res.rows[0] || null;
};

// Helper: get all rows
const queryAll = async (text, params) => {
  const res = await pool.query(text, params);
  return res.rows;
};

module.exports = { pool, query, queryOne, queryAll };
