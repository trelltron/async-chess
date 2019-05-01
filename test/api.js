require('chai').should();

const session = require('supertest-session');
const mockery = require('mockery');

var server;

mockeryConfig = {
  warnOnReplace: false,
  warnOnUnregistered: false,
  useCleanCache: true
};

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
    _get_by_uid_result: { rows: [] }
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

mockeryConfig = {
  warnOnReplace: false,
  warnOnUnregistered: false,
  useCleanCache: true
};

describe('API /api/v1/auth', function() {
  describe('GET /me', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return 401 when not signed in', function(done) {
      mockery.registerMock('../db', {});
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))
      mockery.enable(mockeryConfig);
      server = require('../server');
      session(server)
        .get('/api/v1/auth/me')
        .expect(401, done)
    });

    it('should return 200 with details when signed in', function(done) {
      let dbMock = makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'test-uid' }
      ];
      dbMock.users._get_by_uid_result.rows = [
        { nickname: 'test' }
      ]
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))
      mockery.enable(mockeryConfig);
      server = require('../server');
      currentSession = session(server);
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          currentSession
            .get('/api/v1/auth/me')
            .expect(200, {
              nickname: 'test'
            }, done)
        })
    });
  });

  describe('POST /login', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return 400 when token not sent', function(done) {
      mockery.registerMock('../db', {});
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))
      mockery.enable(mockeryConfig);
      server = require('../server');
      session(server)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400, done)
    });

    it('should return 400 when token invalid', function(done) {
      mockery.registerMock('../db', {});
      mockery.enable(mockeryConfig);
      server = require('../server');
      session(server)
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(400, done)
    });

    it('should return 404 when no existing user matches token', function(done) {
      mockery.registerMock('../db', makeDatabaseMock());
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))
      mockery.enable(mockeryConfig);
      server = require('../server');
      session(server)
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(404, done)
    });

    it('should return 200 when existing user matches token', function(done) {
      let dbMock = makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test' }
      ];
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))
      mockery.enable(mockeryConfig);
      server = require('../server');
      session(server)
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200, done)
    });

    it('should have set session on 200 response', function(done) {
      let dbMock = makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'test-uid' }
      ];
      dbMock.users._get_by_uid_result.rows = [
        { nickname: 'test' }
      ]
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))
      mockery.enable(mockeryConfig);
      server = require('../server');
      currentSession = session(server);
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          currentSession
            .get('/api/v1/auth/me')
            .expect(200, done)
        })
    });
  });
});



describe('API /api/v1/games', function() {
  describe('GET /', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return list of users games', function(done) {
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))

      let dbMock = makeDatabaseMock()
      dbMock.games._list_for_user_uid_result.rows = [
        { uid: 'game-1-uid', data: { history: [] } }
      ];
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      mockery.registerMock('../db', dbMock);

      mockery.enable(mockeryConfig);

      server = require('../server');
      currentSession = session(server);

      // Authenticate session
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // Test endpoint
          currentSession
            .get('/api/v1/games')
            .expect(200, {
              games: [
                {
                  uid: 'game-1-uid',
                  history: [],
                  my_side: 'b',
                  current_side: 'w',
                  turn: 1
                }
              ]
            }, done)
        });

    });
  });

  describe('POST /invite', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return 404 for bad user reference', function(done) {
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))

      let dbMock = makeDatabaseMock()
      // dbMock.games._insert_result.rows = [
      //   { uid: 'game-1-uid', data: { history: [] } }
      // ];
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      mockery.registerMock('../db', dbMock);

      mockery.enable(mockeryConfig);

      server = require('../server');
      currentSession = session(server);

      // Authenticate session
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // Test endpoint
          currentSession
            .post('/api/v1/games/invite')
            .send({ nickname: 'invited-1'})
            .expect(404, done)
        });
    });

    it('should return 201 for valid reference', function(done) {
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))

      let dbMock = makeDatabaseMock()
      dbMock.games._insert_result.rows = [
        { uid: 'game-1-uid', data: { history: [] } }
      ];
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      dbMock.users._get_by_nickname_result.rows = [
        { uid: 'other-player-uid' }
      ];
      mockery.registerMock('../db', dbMock);

      mockery.enable(mockeryConfig);

      server = require('../server');
      currentSession = session(server);

      // Authenticate session
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // Test endpoint
          currentSession
            .post('/api/v1/games/invite')
            .send({ nickname: 'invited-1'})
            .expect(201, {
              uid: 'game-1-uid',
              data: {
                history: []
              }
            }, done)
        });
    });
  });

  describe('POST /:uid/move', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return 404 if active game doesnt exist', function(done) {
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))

      let dbMock = makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      mockery.registerMock('../db', dbMock);

      mockery.enable(mockeryConfig);

      server = require('../server');
      currentSession = session(server);

      // Authenticate session
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // Test endpoint
          currentSession
            .post('/api/v1/games/test-game-uid/move')
            .send({ to: 'a1', from: 'a2' })
            .expect(404, done)
        });
    });

    it('should return 403 if game doesnt include user', function(done) {
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))

      let dbMock = makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      dbMock.games._get_by_uid_result.rows = [
        { uid:  'game-1-uid', player_black_uid: 'other-player-uid', player_white_uid: 'third-player-uid', data: { history: [] }, timestamp: 'test-timestamp'}
      ]
      mockery.registerMock('../db', dbMock);

      mockery.enable(mockeryConfig);

      server = require('../server');
      currentSession = session(server);

      // Authenticate session
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // Test endpoint
          currentSession
            .post('/api/v1/games/test-game-uid/move')
            .send({ to: 'a4', from: 'a2' })
            .expect(403, done)
        });
    });

    it('should return 400 if turn is invalid', function(done) {
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))

      let dbMock = makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      dbMock.games._get_by_uid_result.rows = [
        { uid:  'game-1-uid', player_black_uid: 'player-uid', player_white_uid: 'other-player-uid', data: { history: [] }, timestamp: 'test-timestamp'}
      ]
      mockery.registerMock('../db', dbMock);

      mockery.enable(mockeryConfig);

      server = require('../server');
      currentSession = session(server);

      // Authenticate session
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // Test endpoint
          currentSession
            .post('/api/v1/games/test-game-uid/move')
            .send({ to: 'a4', from: 'a2' })
            .expect(400, done)
        });
    });

    it('should return 400 if move is invalid', function(done) {
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))

      let dbMock = makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      dbMock.games._get_by_uid_result.rows = [
        { uid:  'game-1-uid', player_black_uid: 'other-player-uid', player_white_uid: 'player-uid', data: { history: [] }, timestamp: 'test-timestamp'}
      ]
      mockery.registerMock('../db', dbMock);

      mockery.enable(mockeryConfig);

      server = require('../server');
      currentSession = session(server);

      // Authenticate session
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // Test endpoint
          currentSession
            .post('/api/v1/games/test-game-uid/move')
            .send({ to: 'a1', from: 'a2' })
            .expect(400, done)
        });
    });

    it('should return 201 if move is valid', function(done) {
      mockery.registerMock('google-auth-library', makeMockAuthLib({}))

      let dbMock = makeDatabaseMock()
      dbMock.games._insert_result.rows = [
        { uid: 'game-1-uid', data: { history: [] } }
      ];
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      dbMock.games._get_by_uid_result.rows = [
        { uid:  'game-1-uid', player_black_uid: 'other-player-uid', player_white_uid: 'player-uid', data: { history: [] }, timestamp: 'test-timestamp'}
      ]
      dbMock.games._update_if_timestamp_result.rows = [
        { uid: 'game-1-uid' }
      ]
      mockery.registerMock('../db', dbMock);

      mockery.enable(mockeryConfig);

      server = require('../server');
      currentSession = session(server);

      // Authenticate session
      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          // Test endpoint
          currentSession
            .post('/api/v1/games/test-game-uid/move')
            .send({ to: 'a4', from: 'a2' })
            .expect(201, done)
        });
    });
  });
});