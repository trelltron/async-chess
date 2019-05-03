const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const uuid = require('uuid/v4');

const { authRouter, gamesRouter } = require('./routes')

require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  genid: () => uuid(),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: true
}));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/games', gamesRouter);

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

if (!module.parent) app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;