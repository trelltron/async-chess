require('dotenv').config();

const Pool = require('pg').Pool

const createPool = () => {
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    })
  }
  return new Pool({
    user: process.env.PGUSER || 'asyncchess',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'asyncchess',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
  })
}

const pool = createPool();

function query(text, params, callback) {
  const start = Date.now();
  return pool.query(text, params, (err, res) => {
    const duration = Date.now() - start
    console.log('executed query', { 
      text, 
      duration, 
      error: !!err, 
      rowCount: res ? res.rowCount : null
    })
    callback(err, res)
  })
}

query.end = () => pool.end();

module.exports = query;