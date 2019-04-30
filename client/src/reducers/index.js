import { SET_TOKEN, SET_USER, SET_AUTH_REQUIRED, SET_ACTIVE_GAME, SET_LOCAL_GAME } from '../actions'

const loadLocalGame = () => {
  try {
    return JSON.parse(localStorage.getItem('local-game'));
  } catch {
    return null;
  }
}

const initialState = {
  auth: {
    user: null,
    auth_required: false,
    token: null
  },
  activeGame: null,
  localGame: loadLocalGame()
}

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
    case SET_ACTIVE_GAME:
      return Object.assign({}, state, {
        activeGame: action.game
      })
    case SET_LOCAL_GAME:
      localStorage.setItem('local-game', JSON.stringify(action.game));
      return Object.assign({}, state, {
        localGame: action.game
      })
    default:
      return state
  }
}