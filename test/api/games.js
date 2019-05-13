require('chai').should();
const mockery = require('mockery');

const utils = require('./utils');

describe('API /api/v1/games', function() {
  describe('GET /', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return list of users games', function(done) {
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))

      let dbMock = utils.makeDatabaseMock()
      dbMock.games._list_for_user_uid_result.rows = [
        { uid: 'game-1-uid', data: { history: [] } }
      ];
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      mockery.registerMock('../db', dbMock);

      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))

      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      mockery.registerMock('../db', dbMock);

      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}));

      let dbMock = utils.makeDatabaseMock();
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
      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))

      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      mockery.registerMock('../db', dbMock);

      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))

      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      dbMock.games._get_by_uid_result.rows = [
        { uid:  'game-1-uid', player_black_uid: 'other-player-uid', player_white_uid: 'third-player-uid', data: { history: [] }, timestamp: 'test-timestamp'}
      ]
      mockery.registerMock('../db', dbMock);

      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))

      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      dbMock.games._get_by_uid_result.rows = [
        { uid:  'game-1-uid', player_black_uid: 'player-uid', player_white_uid: 'other-player-uid', data: { history: [] }, timestamp: 'test-timestamp'}
      ]
      mockery.registerMock('../db', dbMock);

      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))

      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'player-uid' }
      ];
      dbMock.games._get_by_uid_result.rows = [
        { uid:  'game-1-uid', player_black_uid: 'other-player-uid', player_white_uid: 'player-uid', data: { history: [] }, timestamp: 'test-timestamp'}
      ]
      mockery.registerMock('../db', dbMock);

      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))

      let dbMock = utils.makeDatabaseMock()
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

      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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