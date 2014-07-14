// XXX: a lot of janky mocking here, not sure it's a great idea.

ServiceConfiguration.configurations.insert({
  service: 'google',
  client_id: 'foo',
  client_secret: 'bar'
});

// mock out http
HTTP.nextResult = '';
HTTP.call = function(method, url, params, callback) {
  var self = this;
  
  if (_.isFunction(callback))
    return callAync.call(this, method, url, params, callback);

  return {statusCode: 200, data: {
    access_token: 'good',
    expires_in: 200
  }};
}

// async version
var callAync = function(method, url, params, callback) {
  var self = this;

  Meteor.setTimeout(function() {
    if (params.headers && params.headers.Authorization && 
        params.headers.Authorization.match(/bad/)) {
      // console.log('returning 401')
      return callback({response: {statusCode: 401}});
    }

    // console.log('returning', self.nextResult, 'from Http.call')
    return callback(null, {
      statusCode: 200,
      data: self.nextResult
    });
  });
}


if (Meteor.isServer) {
  Meteor.publish('user', function() {
    return Meteor.users.find(this.userId);
  });
  
  Meteor.methods({
    mockUser: function(testId, token) {
      var id = Meteor.users.insert({
        _id: 'mockedUserId' + testId,
        services: {google: {
          accessToken: token,
          refreshToken: '456'
        }}
      });
      
      return id
    },
    
    loginAs: function(userId) {
      this.setUserId(userId);
      return {id: userId};
    }
  })
  
  Tinytest.add('GoogleApi - Sync - get basic', function(test) {
    var userId = Meteor.call('mockUser', test.id, 'good');
    
    HTTP.nextResult = 'foo';
    var result = GoogleApi.get('/foo/bar', {user: Meteor.users.findOne(userId)});

    test.equal(result, 'foo');
  });
  
  Tinytest.add('GoogleApi - Sync - get with refresh', function(test) {
    var userId = Meteor.call('mockUser', test.id, 'bad');

    HTTP.nextResult = 'foo';
    var result = GoogleApi.get('/foo/bar', {user: Meteor.users.findOne(userId)});

    test.equal(result, 'foo');
  });
} else {
  var loginAs = function(userId, cb) {
    Accounts.callLoginMethod({
      methodName: 'loginAs',
      methodArguments: [userId],
      userCallback: function() { Meteor.subscribe('user', cb) }});
  }
  
  // same tests with promises
  
  Tinytest.addAsync('GoogleApi - Promises - get basic', function(test, done) {
    Meteor.call('mockUser', test.id, 'good', function(error, userId) {
      loginAs(userId, function() {
        HTTP.nextResult = 'foo';
        GoogleApi.get('/foo/bar', {}).then(function(result) {
          console.log(result)
          test.equal(result, 'foo');
          done();
        }).fail(function(err) {
          console.log(err)
        });
      });
    });
  });
  
  Tinytest.addAsync('GoogleApi - Promises - get with refresh', function(test, done) {
    Meteor.call('mockUser', test.id, 'bad', function(error, userId) {
      loginAs(userId, function() {
        HTTP.nextResult = 'foo';
        GoogleApi.get('/foo/bar', {}).then(function(result) {
          test.equal(result, 'foo');
          done();
        });
      });
    });
  });
  
}
