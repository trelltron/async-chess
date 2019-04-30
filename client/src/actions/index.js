
export const SET_TOKEN = 'STORE_TOKEN';
export const SET_USER = 'SET_USER';
export const SET_AUTH_REQUIRED = 'SET_AUTH_REQUIRED';

export const SET_ACTIVE_GAME = 'SET_ACTIVE_GAME';
export const SET_LOCAL_GAME = 'SET_LOCAL_GAME';

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


export const setActiveGame = (game) => ({
  type: SET_ACTIVE_GAME,
  game
})

export const setLocalGame = (game) => ({
  type: SET_LOCAL_GAME,
  game
})