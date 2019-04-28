require('chai').should();
const rewire = require('rewire');

const make_request_mock = (user_uid) => ({
  session: {
    user_uid
  }
})
const make_response_mock = () => ({
  status: function(input) {
    this._called_status.push(input);
    return this;
  },
  _called_status: [],
  end: function() {
    this._called_end += 1;
  },
  _called_end: 0,
  json: function(arg) {
    this._called_json.push(arg);
  },
  _called_json: []
});

describe('API /api/v1/auth', function() {
  describe('GET /me', function() {
    it('should return 404 when user_id not in session', function() {
      const api_auth = rewire('../api/auth');
      const get_me = api_auth.__get__('get_me');
      let req = make_request_mock(null)
      let res = make_response_mock();
      get_me(req, res);
      res._called_status.should.have.lengthOf(1);
      res._called_status[0].should.equal(404);
      res._called_end.should.equal(1);
    });

    it('should return 404 when user not found in DB', function() {
      const api_auth = rewire('../api/auth');
      const mock_db = {
        users: {
          get_by_uid: function(uid, callback) {
            callback(null, { rows: []})
          }
        }
      }
      api_auth.__set__('db', mock_db)
      let req = make_request_mock('dummy_user_id');
      let res = make_response_mock();
      const get_me = api_auth.__get__('get_me');
      get_me(req, res);
      res._called_status.should.have.lengthOf(1);
      res._called_status[0].should.equal(404);
      res._called_end.should.equal(1);
    });

    it('should return user if valid ID found in session', function() {
      const api_auth = rewire('../api/auth');
      const mock_db = {
        users: {
          get_by_uid: function(uid, callback) {
            callback(null, { rows: [{ nickname: 'tester' }]})
          }
        }
      }
      api_auth.__set__('db', mock_db)
      let req = make_request_mock('dummy_user_id');
      let res = make_response_mock();
      const get_me = api_auth.__get__('get_me');
      get_me(req, res);
      res._called_status.should.have.lengthOf(1);
      res._called_status[0].should.equal(200);
      res._called_json.should.have.lengthOf(1);
      res._called_json[0].should.have.all.keys('nickname');
    });
  });

  describe('GET /me', function() {
    it('should return 404 when user_id not in session', function() {
      const api_auth = rewire('../api/auth');
      const get_me = api_auth.__get__('get_me');
      let req = make_request_mock(null)
      let res = make_response_mock();
      get_me(req, res);
      res._called_status.should.have.lengthOf(1);
      res._called_status[0].should.equal(404);
      res._called_end.should.equal(1);
    });

    it('should return 404 when user not found in DB', function() {
      const api_auth = rewire('../api/auth');
      const mock_db = {
        users: {
          get_by_uid: function(uid, callback) {
            callback(null, { rows: []})
          }
        }
      }
      api_auth.__set__('db', mock_db)
      let req = make_request_mock('dummy_user_id');
      let res = make_response_mock();
      const get_me = api_auth.__get__('get_me');
      get_me(req, res);
      res._called_status.should.have.lengthOf(1);
      res._called_status[0].should.equal(404);
      res._called_end.should.equal(1);
    });

    it('should return user if valid ID found in session', function() {
      const api_auth = rewire('../api/auth');
      const mock_db = {
        users: {
          get_by_uid: function(uid, callback) {
            callback(null, { rows: [{ nickname: 'tester' }]})
          }
        }
      }
      api_auth.__set__('db', mock_db)
      let req = make_request_mock('dummy_user_id');
      let res = make_response_mock();
      const get_me = api_auth.__get__('get_me');
      get_me(req, res);
      res._called_status.should.have.lengthOf(1);
      res._called_status[0].should.equal(200);
      res._called_json.should.have.lengthOf(1);
      res._called_json[0].should.have.all.keys('nickname');
    });
  });
});