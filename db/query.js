require('dotenv').config();

const Pool = require('pg').Pool

const pool = new Pool({
  user: process.env.PG_USER,
  host: 'localhost',
  database: 'asyncchess',
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
})

function query(text, params, callback) {
  const start = Date.now();
  return pool.query(text, params, (err, res) => {
    const duration = Date.now() - start
    console.log('executed query', { text, duration, rows: res.rowCount })
    callback(err, res)
  })
}

query.end = () => pool.end();

module.exports = query;