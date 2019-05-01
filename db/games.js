const query = require('./query');

const GET_BY_UID = `
  SELECT
    uid, player_white_uid, player_black_uid, data, last_updated::text
  FROM
    games
  WHERE
    uid = $1::uuid
`

function get_by_uid(uid, callback) {
  query(GET_BY_UID, [uid], callback);
}

// TODO: Might be betetr to explicitly merge 2 subqueries for the black/white cases
const LIST_FOR_USER_UID_QUERY = `
  SELECT
    games.uid, games.player_white_uid, games.player_black_uid, 
    player_white.nickname AS white_nickname, 
    player_black.nickname AS black_nickname,
    games.data, games.last_updated::text
  FROM
    games
  JOIN
    users AS player_white ON player_white.uid = games.player_white_uid
  JOIN
    users AS player_black ON player_black.uid = games.player_black_uid
  WHERE
    player_black_uid = $1::uuid OR player_white_uid = $1::uuid
  ORDER BY
    last_updated DESC
`

function list_for_user_uid(uid, callback) {
  query(LIST_FOR_USER_UID_QUERY, [uid], callback);
}

const INSERT_QUERY = `
  INSERT INTO
    games (player_white_uid, player_black_uid, data)
  VALUES
    ($1::uuid, $2::uuid, $3::json)
  RETURNING uid
`

function insert(white_uid, black_uid, data, callback) {
  query(INSERT_QUERY, [white_uid, black_uid, data], callback);
}

const UPDATE_QUERY = `
  UPDATE
    games
  SET
    data = $2::json,
    last_updated = now()
  WHERE
    uid = $1::uuid AND last_updated = ($3::text)::timestamp
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