const query = require('./query');

const GET_BY_UID_QUERY = `
  SELECT nickname FROM users WHERE uid = $1::uuid
`

function get_by_uid(uid, callback) {
  query(GET_BY_UID_QUERY, [uid], callback);
}

const GET_BY_NICKNAME_QUERY = `
  SELECT uid FROM users WHERE nickname = $1::text
`

function get_by_nickname(nickname, callback) {
  query(GET_BY_NICKNAME_QUERY, [nickname], callback);
}

const GET_BY_GOOGLE_ID_QUERY = `
  SELECT uid, nickname FROM users WHERE google_id = $1::text
`

function get_by_google_id(google_id, callback) {
  query(GET_BY_GOOGLE_ID_QUERY, [google_id], callback);
}

// TODO: Replace this very dirty way to achieve get-or-create within a single transaction with something better
const GET_OR_CREATE_QUERY = `
  INSERT INTO 
    users (google_id, nickname) 
  VALUES 
    ($1::text, $2::text)
  ON CONFLICT 
    (google_id) DO UPDATE
  SET 
    nickname = EXCLUDED.nickname
  RETURNING 
    uid, nickname
`

function get_or_create(google_id, nickname, callback) {
  query(GET_OR_CREATE_QUERY, [google_id, nickname], callback);
}

module.exports = {
  get_by_uid,
  get_by_nickname,
  get_by_google_id,
  get_or_create
}