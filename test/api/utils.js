const session = require('supertest-session');

const getSession = () => {
  server = require('../../server');
  return session(server);
}

const login = (session, callback) => {
  session
    .post('/api/v1/auth/login')
    .send({ token: 'testToken' })
    .end(callback);
}

const getAuthedSession = (callback) => {
  let session = getSession();
  login(session, (err, res) => {
    callback(session)
  })
}

const makeDatabaseMock = () => ({
  users: {
    get_by_nickname: function(nickname, callback) {
      callback(null, this._get_by_nickname_result);
    },
    _get_by_nickname_result: { rows: [] },
    get_by_google_id: function(google_id, callback) {
      callback(null, this._get_by_google_id_result);
    },
    _get_by_google_id_result: { rows: [] },
    get_by_uid: function(uid, callback) {
      callback(null, this._get_by_uid_result);
    },
    _get_by_uid_result: { rows: [] },
    insert: function(google_id, nickname, callback) {
      callback(null, this._insert_result);
    },
    _insert_result: { rows: [] }
  },
  games: {
    list_for_user_uid: function(uid, callback) {
      callback(null, this._list_for_user_uid_result);
    },
    _list_for_user_uid_result: { rows: [] },
    insert: function(white_uid, black_uid, data, callback) {
      callback(null, this._insert_result);
    },
    _insert_result: { rows: [] },
    get_by_uid: function(uid, callback) {
      callback(null, this._get_by_uid_result);
    },
    _get_by_uid_result: { rows: [] },
    update_if_timestamp: function(uid, data, timestamp, callback) {
      callback(null, this._update_if_timestamp_result);
    },
    _update_if_timestamp_result: { rows: [] }
  }
});

const makeMockAuthLib = (payload, expectedToken) => ({
  OAuth2Client: function() {
    this.verifyIdToken = async (input) => {
      if (expectedToken) {
        input.idToken.should.equal(expectedToken);
      }
      return {
        getPayload: () => payload
      }
    };
  }
});

const enableMockery = (instance) => {
  instance.enable({
    warnOnReplace: false,
    warnOnUnregistered: false,
    useCleanCache: true
  });
}

module.exports = {
  makeMockAuthLib,
  makeDatabaseMock,
  enableMockery,
  getSession,
  login,
  getAuthedSession
}