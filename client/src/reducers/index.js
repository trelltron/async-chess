import { 
  SET_TOKEN, SET_USER, SET_AUTH_REQUIRED, 
  SET_GAME_LIST, SET_ACTIVE_GAME_ID, UPDATE_GAME_STATE, 
  CREATE_LOCAL_GAME, DELETE_LOCAL_GAME
} from '../actions';

const loadLocalGame = () => {
  try {
    return JSON.parse(localStorage.getItem('local-game'));
  } catch {
    return null;
  }
};

const writeLocalGame = (game) => {
  if (!game) {
    return localStorage.removeItem('local-game');
  }
  localStorage.setItem('local-game', JSON.stringify(game));
}

const initialState = {
  auth: {
    user: null,
    auth_required: false,
    token: null
  },
  activeGameId: null,
  localGame: loadLocalGame(),
  gameList: []
};

export default function(state=initialState, action) {
  switch (action.type) {
    case SET_TOKEN:
      return Object.assign({}, state, {
        auth: Object.assign({}, state.auth, { token: action.token })
      })
    case SET_USER:
      return Object.assign({}, state, {
        auth: { user: action.user, auth_required: false, token: null }
      })
    case SET_AUTH_REQUIRED:
      return Object.assign({}, state, {
        auth: Object.assign({}, state.auth, { auth_required: true })
      })
    case SET_ACTIVE_GAME_ID:
      return Object.assign({}, state, {
        activeGameId: action.uid
      })
    case UPDATE_GAME_STATE:
      if (action.game.uid === 'local') {
        writeLocalGame(action.game);
        return Object.assign({}, state, {
          localGame: action.game
        });
      }
      let gameList = state.gameList.map((game) => {
        if (game.uid === action.game.uid) {
          return Object.assign({}, action.game);
        } else {
          return Object.assign({}, game)
        }
      });
      return Object.assign({}, state, {
        gameList
      });
    case SET_GAME_LIST:
      return Object.assign({}, state, {
        gameList: action.games
      });
    case CREATE_LOCAL_GAME:
      let localGame = { 
        uid: 'local', 
        history: [], 
        current_side: 'w', 
        turn: 1 
      };
      writeLocalGame(localGame);
      return Object.assign({}, state, {
        localGame,
        activeGameId: 'local'
      });
    case DELETE_LOCAL_GAME:
      writeLocalGame(null);
      return Object.assign({}, state, {
        localGame: null,
        activeGameId: null
      });
    default:
      return state
  }
}