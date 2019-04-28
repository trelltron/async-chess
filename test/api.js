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
    get_by_google_id: function(google_id, callback) {
      callback(null, this._get_by_google_id_result);
    },
    _get_by_google_id_result: { rows: [] },
    get_by_uid: function(uid, callback) {
      callback(null, this._get_by_uid_result);
    },
    _get_by_uid_result: { rows: [] }
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