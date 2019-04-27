import { SET_TOKEN, SET_USER, SET_AUTH_REQUIRED } from '../actions'

const initialState = {
  auth: {
    user: null,
    auth_required: false,
    token: null
  }
}

export default function(state=initialState, action) {
  console.log(action);
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
    default:
      return state
  }
}