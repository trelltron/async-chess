
export const SET_TOKEN = 'STORE_TOKEN';
export const SET_USER = 'SET_USER';
export const SET_AUTH_REQUIRED = 'SET_AUTH_REQUIRED';

export const SET_GAME_LIST = 'SET_GAME_LIST'
export const SET_ACTIVE_GAME_ID = 'SET_ACTIVE_GAME_ID';
export const UPDATE_GAME_STATE = 'UPDATE_GAME_STATE';
export const CREATE_LOCAL_GAME = 'CREATE_LOCAL_GAME';
export const DELETE_LOCAL_GAME = 'DELETE_LOCAL_GAME';

export const setToken = (token) => ({
  type: SET_TOKEN,
  token
})

export const setUser = (user) => ({
  type: SET_USER,
  user
})

export const setAuthRequired = () => ({
  type: SET_AUTH_REQUIRED
})


export const setActiveGameId = (uid) => ({
  type: SET_ACTIVE_GAME_ID,
  uid
})

export const updateGameState = (game) => ({
  type: UPDATE_GAME_STATE,
  game
})

export const setGameList = (games) => ({
  type: SET_GAME_LIST,
  games
})

export const createLocalGame = () => ({
  type: CREATE_LOCAL_GAME
})

export const deleteLocalGame = () => ({
  type: DELETE_LOCAL_GAME
})