/* EduSphere LMS — PostgreSQL Database Connection Pool */
require('dotenv').config();
const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');

const authStorage = new AsyncLocalStorage();

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'edusphere_db',
  user:     process.env.DB_APP_USER || process.env.DB_USER || 'postgres',
  password: process.env.DB_APP_PASSWORD || process.env.DB_PASSWORD || 'postgres',
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

// Helper: run a query with RLS context if available
const query = async (text, params) => {
  const userContext = authStorage.getStore();
  if (!userContext) {
    return pool.query(text, params);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.current_user_id = $1`, [userContext.userId || '']);
    await client.query(`SET LOCAL app.current_user_role = $2`, [userContext.role || '']);
    await client.query(`SET LOCAL app.current_db_id = $3`, [String(userContext.dbId || 0)]);
    const res = await client.query(text, params);
    await client.query('COMMIT');
    return res;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Helper: get single row
const queryOne = async (text, params) => {
  const res = await query(text, params);
  return res.rows[0] || null;
};

// Helper: get all rows
const queryAll = async (text, params) => {
  const res = await query(text, params);
  return res.rows;
};

module.exports = { pool, query, queryOne, queryAll, authStorage };
