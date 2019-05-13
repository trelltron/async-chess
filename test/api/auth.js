require('chai').should();
const mockery = require('mockery');

const utils = require('./utils');

describe('API /api/v1/auth', function() {
  describe('GET /me', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return 401 when not signed in', function(done) {
      mockery.registerMock('../db', {});
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .get('/api/v1/auth/me')
        .expect(401, done);
    });

    it('should return 200 with details when signed in', function(done) {
      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'test-uid' }
      ];
      dbMock.users._get_by_uid_result.rows = [
        { nickname: 'test' }
      ]
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      let currentSession = utils.getSession();
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
            }, done);
        });
    });
  });

  describe('POST /login', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return 400 when token not sent', function(done) {
      mockery.registerMock('../db', {});
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/login')
        .send({})
        .expect(400, done)
    });

    it('should return 400 when token invalid', function(done) {
      mockery.registerMock('../db', {});
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(400, done)
    });

    it('should return 404 when no existing user matches token', function(done) {
      mockery.registerMock('../db', utils.makeDatabaseMock());
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(404, done)
    });

    it('should return 200 when existing user matches token', function(done) {
      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test' }
      ];
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200, done)
    });

    it('should have set session on 200 response', function(done) {
      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'test-uid' }
      ];
      dbMock.users._get_by_uid_result.rows = [
        { nickname: 'test' }
      ]
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

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

  describe('POST /signup', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return 400 when missing token', function(done) {
      let dbMock = utils.makeDatabaseMock()
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/signup')
        .send({ nickname: 'ValidNickname' })
        .expect(400, {
          code: 'token_missing',
          msg: 'Signup requires a google OAuth token' 
        }, done);
    });

    it('should return 400 when nickname missing', function(done) {
      let dbMock = utils.makeDatabaseMock()
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/signup')
        .send({ token: 'testToken' })
        .expect(400, {
          code: 'nickname_invalid', 
          msg: 'Signup requires a nickname between 5 and 20 characters' 
        }, done);
    });

    it('should return 400 when nickname too short', function(done) {
      let dbMock = utils.makeDatabaseMock()
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);
      
      utils.getSession()
        .post('/api/v1/auth/signup')
        .send({ token: 'testToken', nickname: 'tiny' })
        .expect(400, {
          code: 'nickname_invalid', 
          msg: 'Signup requires a nickname between 5 and 20 characters' 
        }, done);
    });

    it('should return 400 when nickname too long', function(done) {
      let dbMock = utils.makeDatabaseMock()
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/signup')
        .send({ token: 'testToken', nickname: 'nicknameisabittoolong' })
        .expect(400, {
          code: 'nickname_invalid', 
          msg: 'Signup requires a nickname between 5 and 20 characters' 
        }, done);
    });

    it('should return 400 when nickname exists', function(done) {
      let dbMock = utils.makeDatabaseMock()
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/signup')
        .send({ token: 'testToken', nickname: 'ValidNickname' })
        .expect(400, {
          code: 'nickname_exists'
        }, done);
    });

    it('should return 200 when google ID exists', function(done) {
      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { uid: 'some-uid', nickname: 'ValidNickname' }
      ]
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/signup')
        .send({ token: 'testToken', nickname: 'ValidNickname' })
        .expect(200, done);
    });

    it('should return 201 when user created successfully', function(done) {
      let dbMock = utils.makeDatabaseMock()
      dbMock.users._insert_result.rows = [
        { uid: 'some-uid', nickname: 'ValidNickname' }
      ]
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      utils.getSession()
        .post('/api/v1/auth/signup')
        .send({ token: 'testToken', nickname: 'ValidNickname' })
        .expect(201, done);
    });
  });

  describe('POST /logout', function() {
    afterEach(function(){
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should log out user and prevent further actions', function(done) {
      let dbMock = utils.makeDatabaseMock()
      dbMock.users._get_by_google_id_result.rows = [
        { nickname: 'test', uid: 'test-uid' }
      ];
      dbMock.users._get_by_uid_result.rows = [
        { nickname: 'test' }
      ]
      mockery.registerMock('../db', dbMock);
      mockery.registerMock('google-auth-library', utils.makeMockAuthLib({}))
      utils.enableMockery(mockery);

      let currentSession = utils.getSession();

      currentSession
        .post('/api/v1/auth/login')
        .send({ token: 'testToken' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          currentSession
            .get('/api/v1/auth/me')
            .expect(200)
            .end((err, res) => {
              currentSession
                .post('/api/v1/auth/logout')
                .expect(200)
                .end((err, res) => {
                  if (err) return done(err);
                  currentSession
                    .get('/api/v1/auth/me')
                    .expect(401, done)
                })
            });
        });
    });
  });
});