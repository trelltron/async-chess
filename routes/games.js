const routes = require('express').Router();

const Chess = require('chess.js').Chess;

const db = require('../db')

const otherSide = (side) => (side === 'w') ? 'b' : 'w';

const resolveGameState = (data) => {
  let state = Chess();
  if (data && data.history) {
    data.history.forEach((move) => {
      state.move(move);
    });
  }
  return state;
};

// Quickly work out turn info from history
const getTurnInfo = (history) => {
  let side = (history.length % 2) ? 'b' : 'w';
  let turn = Math.floor(history.length / 2) + 1
  return  { side, turn }
};

// Flatten game data for frontend
const formatGame = (user_uid) => (game) => {
  let opponent_nickname, my_side;
  if (user_uid === game.player_white_uid) {
    my_side = 'w';
    opponent_nickname = game.black_nickname;
  } else {
    my_side = 'b';
    opponent_nickname = game.white_nickname;
  }

  let { side, turn } = getTurnInfo(game.data.history)

  return {
    uid: game.uid,
    history: game.data.history,
    last_updated: game.last_updated,
    my_side,
    current_side: side,
    opponent_nickname,
    turn,
    finished: game.data.finished,
    winner: game.data.winner
  }
}

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
    res.status(200).json({ games: result.rows.map(formatGame(req.session.user_uid)) });
  });
};

// Create a new game between the authenticated user and the user with the provided nickname
const post_invite = (req, res) => {
  if (!req.session.user_uid) {
    res.status(401).end();
    return;
  }
  let data = { history: [], finished: null, winner: null };

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
    let player_black_uid = result.rows[0].player_black_uid;
    let player_white_uid = result.rows[0].player_white_uid;
    let gameState = resolveGameState(data);

    if (player_black_uid !== req.session.user_uid && player_white_uid !== req.session.user_uid) {
      return res.status(403).json();
    }

    let current_player = gameState.turn();
    if ((current_player === 'b' && player_black_uid !== req.session.user_uid) || 
        (current_player === 'w' && player_white_uid !== req.session.user_uid)) {
      return res.status(400).json({ code: 'turn_invalid' });
    }

    let validate = gameState.move(move);
    if (!validate) return res.status(400).json({ code: 'move_invalid' });
    data.history.push(move);

    if (gameState.game_over()) {
      data.finished = true;
      if (gameState.in_checkmate()) {
        data.winner = otherSide(gameState.turn());
      }
    }

    db.games.update_if_timestamp(game_uid, data, last_updated, (err, result) => {
      if (err) {
        throw err;
      }
      console.log(result);
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