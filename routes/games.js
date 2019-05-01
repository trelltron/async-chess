const routes = require('express').Router();

const Chess = require('chess.js').Chess;

const db = require('../db')

const resolveGameState = (data) => {
  let state = Chess();
  if (data && data.history) {
    data.history.forEach((move) => {
      state.move(move);
    });
  }
  return state;
};

// Return a list of games the provided user is involved in
const get_games = (req, res) => {
  if (!req.session.user_uid) {
    res.status(401).end();
    return;
  } 

  db.games.list_for_user_uid(req.session.user_uid, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).json({ games: result.rows });
  });
};

// Create a new game between the authenticated user and the user with the provided nickname
const post_invite = (req, res) => {
  if (!req.session.user_uid) {
    res.status(401).end();
    return;
  }
  let data = { history: [] };

  db.users.get_by_nickname(req.body.nickname, (err, result) => {
    if (err) {
      throw err;
    }
    if (!result.rows || result.rows.length < 1) {
      return res.status(404).json({ code: 'user_not_found' });
    }
    let white_uid = result.rows[0].uid;
    db.games.insert(white_uid, req.session.user_uid, data, (err, result) => {
      if (err) {
        throw err;
      }
      if (result.rows && result.rows.length === 1) {
        return res.status(201).json(result.rows[0]);
      }
      res.status(400).end();
    });
  });

};

// Apply an update to a game if the current user has permission and the update is valid
const post_next_move = (req, res) => {
  if (!req.session.user_uid) {
    res.status(401).end();
    return;
  } 
  let game_uid = req.params.uid;
  // get game
  db.games.get_by_uid(game_uid, (err, result) => {
    if (err) {
      throw err;
    }
    if (result.rows.length < 1) {
      return res.status(404).end();
    }
    // Validate current move
    let data = result.rows[0].data;
    let move = req.body;
    let last_updated = result.rows[0].last_updated;
    let player_black = result.rows[0].player_black;
    let player_white = result.rows[0].player_white;
    let gameState = resolveGameState(data);

    if (player_black !== req.session.user_uid && player_white !== req.session.user_uid) {
      return res.status(403).json();
    }

    let current_player = gameState.turn();
    if ((current_player === 'b' && player_black !== req.session.user_uid) || 
        (current_player === 'w' && player_white !== req.session.user_uid)) {
      return res.status(400).json({ code: 'turn_invalid' });
    }

    let validate = gameState.move(move);
    if (!validate) return res.status(400).json({ code: 'move_invalid' });

    data.history.push(move);
    db.games.update_if_timestamp(game_uid, data, last_updated, (err, result) => {
      if (err) {
        throw err;
      }
      if (result.rows.length < 1) {
        return res.status(409).json({ code: 'state_changed' });
      }
      return res.status(201).json(result.rows[0]);
    });
  });
};

// Register routes
routes.get('/', get_games);
routes.post('/:uid/move', post_next_move);
routes.post('/invite', post_invite);

module.exports = routes;