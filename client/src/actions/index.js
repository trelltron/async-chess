
export const SET_TOKEN = 'STORE_TOKEN';
export const SET_USER = 'SET_USER';
export const SET_AUTH_REQUIRED = 'SET_AUTH_REQUIRED';

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