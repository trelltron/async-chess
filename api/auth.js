const routes = require('express').Router();
const OAuth2Client = require('google-auth-library').OAuth2Client
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const db = require('../db')

async function verifyToken(token) {
  return (await googleAuthClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  })).getPayload();
}

// Get the user for this session if one exists
const get_me = (req, res) => {
  if (!req.session.user_uid) {
    res.status(404).end();
    return;
  } 

  db.users.get_by_uid(req.session.user_uid, (err, result) => {
    if (err) {
      throw err;
    }
    if (result.rows.length === 1) {
      res.status(200).json(result.rows[0]);
    } else {
      // DB should enforce uniqueness on uid field, so this means no user
      res.status(404).end();
    }
  });
};

// Take google id token, authenticate, check if signed up, return user info if exists, else returns error
const post_login = (req, res) => {
  if (!req.body.token) {
    res.status(400).json({ 'error': 'Login requires a google auth token' });
    return;
  }
  verifyToken(req.body.token).then((payload) => {
    const google_id = payload['sub']

    db.users.get_by_google_id(google_id, (err, result) => {
      if (err) {
        throw err;
      }
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
    res.status(400).json({ 'error': 'Token invalid' })
  });
};

// Take google id token and user details, create user object
const post_signup = (req, res) => {
  console.log(req.body);
  if (!req.body.token || !req.body.nickname) {
    res.status(400).json();
    return;
  }
  console.log('verifying token')
  verifyToken(req.body.token).then((payload) => {
    const google_id = payload['sub'];
    db.users.get_or_create(google_id, req.body.nickname, (err, result) => {
      if (err) {
        throw err;
      }
      if (result.rows.length === 1) {
        req.session.user_uid = result.rows[0].uid
        res.status(201).json({ nickname: result.rows[0].nickname });
      } else {
        // Probably shouldn't be possible?
        res.status(500).json();
      }
    });
  }).catch((error) => {
    console.log(error)
    res.status(403).json({ error })
  });
};

// delete session
const post_logout = (req, res) => {
  req.session.destroy(function(err) {
    console.log(err);
    res.status(200).json({ error: err });
  })
};

routes.get('/me', get_me);
routes.post('/login', post_login);
routes.post('/signup', post_signup);
routes.post('/logout', post_logout);

module.exports = routes;