require('dotenv').config();

const Pool = require('pg').Pool

const pool = new Pool({
  user: process.env.PG_USER,
  host: 'localhost',
  database: 'asyncchess',
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
})

module.exports = {
  pool
}