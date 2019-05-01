const query = require('../query');

const CLEAR_SQL = `
  DROP TABLE IF EXISTS games;

  DROP TABLE IF EXISTS users;
`

query(CLEAR_SQL, [], (err, res) => {
  if (err) {
    console.error('Error running DB clear: ', err)
    return
  }
  console.log('DB clear successful.')
  query.end();
})
