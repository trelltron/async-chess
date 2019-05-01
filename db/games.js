const query = require('./query');

const GET_BY_UID = `
  SELECT
    uid, player_white, player_black, data, last_updated
  FROM
    games
  WHERE
    uid = $1::uuid
`

function get_by_uid(uid, callback) {
  query(GET_BY_UID, [uid], callback);
}

const LIST_FOR_USER_UID_QUERY = `
  SELECT 
    uid, data 
  FROM 
    games
  WHERE 
    player_black = $1::uuid OR player_white = $1::uuid
`

function list_for_user_uid(uid, callback) {
  query(LIST_FOR_USER_UID_QUERY, [uid], callback);
}

const INSERT_QUERY = `
  INSERT INTO
    games (player_white, player_black, data)
  VALUES
    ($1::uuid, $2::uuid, $3::text)
  RETURNING uid
`

function insert(white_uid, black_uid, data, callback) {
  query(INSERT_QUERY, [white_uid, black_uid, JSON.stringify(data)], callback);
}

const UPDATE_QUERY = `
  UPDATE
    games
  SET
    data = $2::text,
    last_updated = now()
  WHERE
    uid = $1::uuid AND last_updated = $3::timestamp
  RETURNING
    uid, data, last_updated
`

function update_if_timestamp(uid, data, timestamp, callback) {
  query(UPDATE_QUERY, [uid, data, timestamp], callback);
}

module.exports = {
  get_by_uid,
  list_for_user_uid,
  insert,
  update_if_timestamp
}