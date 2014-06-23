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
      return callback({response: {statusCode: 401}});
    }

    return callback(null, {
      statusCode: 200,
      data: self.nextResult
    });
  });
}


if (Meteor.isServer) {
  Tinytest.add('GoogleApi - Server - get basic', function(test) {
    var userId =  Meteor.users.insert({
      _id: 'mockedUserId' + test.id,
      services: {google: {
        accessToken: 'good',
        refreshToken: '456'
      }}
    });

    HTTP.nextResult = 'foo';
    var result = GoogleApi.get('/foo/bar', {user: Meteor.users.findOne(userId)});

    test.equal(result, 'foo');
  });
  
  Tinytest.add('GoogleApi - Server - get with refresh', function(test) {
    var userId =  Meteor.users.insert({
      _id: 'mockedUserId' + test.id,
      services: {google: {
        accessToken: 'bad',
        refreshToken: '456'
      }}
    });

    HTTP.nextResult = 'foo';
    var result = GoogleApi.get('/foo/bar', {user: Meteor.users.findOne(userId)});

    test.equal(result, 'foo');
  });
}
