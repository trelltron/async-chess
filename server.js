const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');

const uuid = require('uuid/v4')

const { authRouter } = require('./api')

require('dotenv').config();

const port = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  genid: () => uuid(),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

app.use('/api/v1/auth', authRouter)

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;