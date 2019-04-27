const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');

const uuid = require('uuid/v4')
const Pool = require('pg').Pool

const {OAuth2Client} = require('google-auth-library');

require('dotenv').config();

const port = process.env.PORT || 5000;
const pg_port = process.env.PG_PORT || 5432;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  genid: () => uuid(),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const pool = new Pool({
  user: process.env.PG_USER,
  host: 'localhost',
  database: 'asyncchess',
  password: process.env.PG_PASSWORD,
  port: pg_port,
})

async function verifyToken(token) {
  return (await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })).getPayload();
}

// Get the user for this session if one exists
app.get('/api/me', (req, res) => {
  if (!req.session.user_uid) {
    res.status(404).json();
    return;
  } 

  pool.query('SELECT nickname FROM users WHERE uid = $1::uuid', [req.session.user_uid], (err, result) => {
    if (err) {
      throw err;
    }
    if (result.rows.length === 1) {
      res.status(200).json(result.rows[0]);
    } else {
      // DB should enforce uniqueness on uid field, so this means no user
      res.status(404).json();
    }
  });
});

// Take google id token, authenticate, check if signed up, return user info if exists, else returns error
app.post('/api/login', (req, res) => {
  if (!req.body.token) {
    res.status(400).json();
    return;
  }
  verifyToken(req.body.token).then((payload) => {
    const google_id = payload['sub']
    // res.status(200).json({ payload })
    pool.query('SELECT uid, nickname FROM users WHERE google_id = $1::text', [google_id], (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
      if (result.rows.length === 1) {
        req.session.user_uid = result.rows[0].uid
        res.status(200).json({ nickname: result.rows[0].nickname });
      } else {
        // DB should enforce uniqueness on google_id field, so this means no user
        // TODO: Make sure the DB actually respects the above
        res.status(404).json();
      }
    });
  }).catch((error) => {
    console.log(error)
    res.status(500).json()
  });
});

// Take google id token and user details, create user object
app.post('/api/signup', (req, res) => {
  console.log(req.body);
  if (!req.body.token || !req.body.nickname) {
    res.status(400).json();
    return;
  }
  console.log('verifying token')
  verifyToken(req.body.token).then((payload) => {
    const google_id = payload['sub'];
    // TODO: Replace this very dirty way to achieve get-or-create within a single transaction with something better
    pool.query(`INSERT INTO users (google_id, nickname) 
        VALUES ($1::text, $2::text)
        ON CONFLICT (google_id) DO UPDATE
        SET nickname = EXCLUDED.nickname
        RETURNING uid, nickname`, [google_id, req.body.nickname], (err, result) => {
      if (err) {
        throw err;
      }
      console.log('done query');
      console.log(result);
      if (result.rows.length === 1) {
        console.log('got 1 row');
        req.session.user_uid = result.rows[0].uid
        console.log('set session user_uid')
        console.log(result.rows[0].uid)
        res.status(201).json({ nickname: result.rows[0].nickname });
      } else {
        // Probably shouldn't be possible?
        console.log('Why is this happening?');
        console.log(result);
        console.log(google_id)
        res.status(500).json();
      }
    });
  }).catch((error) => {
    console.log(error)
    res.status(403).json({ error })
  });
});

// delete session
app.post('/api/logout', (req, res) => {
  req.session.destroy(function(err) {
    console.log(err);
    res.status(200).json({ error: err });
  })
});

app.listen(port, () => console.log(`Listening on port ${port}`));