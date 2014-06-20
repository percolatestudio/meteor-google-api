// XXX: a lot of janky mocking here, not sure it's a great idea.

ServiceConfiguration.configurations.insert({
  service: 'google',
  client_id: 'foo',
  client_secret: 'bar'
});

// mock out http
HTTP.nextCall401 = false;
HTTP.nextResult = '';
HTTP.call = function(method, url, params, callback) {
  var self = this;
  
  if (_.isFunction(callback))
    return callAync.call(this, method, url, params, callback);

  if (self.nextCall401) {
    self.nextCall401 = false;
    var error = new Error;
    error.response = {statusCode: 401};
    throw error;
  }

  return {statusCode:200, data: self.nextResult};
}

// async version
var callAync = function(method, url, params, callback) {
  var self = this;

  Meteor.setTimeout(function() {
    if (self.nextCall401) {
      self.nextCall401 = false;
      return callback({response: {statusCode: 401}});
    }

    return callback(null, {
      statusCode: 200,
      data: self.nextResult
    });
  });
}


// mock out Meteor.user
var user = {
  _id: 'mockedUserId',
  services: {google: {
    accessToken: '123',
    refreshToken: '456'
  }}
}

Meteor.users.findOne = function() { return user; }

if (Meteor.isServer) {
  Tinytest.add('GoogleApi - Server - get basic', function(test) {
    HTTP.nextResult = 'foo';
    var result = GoogleApi.get('/foo/bar', {user: user});

    test.equal(result, 'foo');
  });
  
  Tinytest.add('GoogleApi - Server - get with refresh', function(test) {
    HTTP.nextResult = 'foo';
    HTTP.nextCall401 = true
    var result = GoogleApi.get('/foo/bar', {user: user});

    test.equal(result, 'foo');
  });
}
