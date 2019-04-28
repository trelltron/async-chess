
const query = require('../query');

const SETUP_SQL = `
  CREATE TABLE 
    users (
      uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      google_id VARCHAR(25) NOT NULL UNIQUE,
      nickname VARCHAR(20) NOT NULL
    )
  ;
`

query(SETUP_SQL, [], (err, res) => {
  if (err) {
    console.error('Error running DB setup: ', err)
    return
  }
  console.log('DB setup successful.')
  query.end();
})