const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Use default values if environment variables are not set
const config = {
  host: process.env.DB_HOST || 'dpg-d5oh0rqli9vc7381ejp0-a.singapore-postgres.render.com',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'K0hpWUxxOrnwYiEgDL3LmY3akP4gjGnR',
  database: process.env.DB_NAME || 'akbriyanidb',
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
};

/* console.log('🔧 Database config:', {
  host: config.host,
  user: config.user,
  database: config.database,
  port: config.port
}); */

const pool = new Pool(config);

const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('🔍 Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('❌ Query error', { text, message: err.message });
    throw err;
  }
};

module.exports = {
  query,
  execute: query, // Alias execute to query for compatibility
  getConnection: async () => {
    const client = await pool.connect();
    // Compatibility layer for mysql2 transaction methods
    client.beginTransaction = () => client.query('BEGIN');
    client.commit = () => client.query('COMMIT');
    client.rollback = () => client.query('ROLLBACK');
    // Also add query logging to client if needed, but let's keep it simple
    return client;
  },
  pool,
};
