// kill logs
var Log = function () {}

GoogleApi = {
  // host component, shouldn't change
  _host: 'https://www.googleapis.com',

  _callAndRefresh: function(method, path, options, callback) {
    var self = this;
    options = options || {};

    self._call(method, path, options,
      // need to bind the env here so we can do mongo writes in the callback
      // (when refreshing), if we call this on the server
      Meteor.bindEnvironment(function(error, result) {
        if (error && error.response && error.response.statusCode == 401) {
          Log('google-api attempting token refresh');

          return self._refresh(options.user, function(error) {
            if (error)
              return callback(error);

            // if we have the user, we'll need to re-fetch them, as their
            // access token will have changed.
            if (options.user)
              options.user = Meteor.users.findOne(options.user._id);

            self._call(method, path, options, callback);
          });
        } else {
          callback(error, result);
        }
    }, 'Google Api callAndRefresh'));
  },

  // call a GAPI Meteor.http function if the accessToken is good
  _call: function(method, path, options, callback) {
    Log('GoogleApi._call, path:' + path);

    // copy existing options to modify
    options = _.extend({}, options)
    var user = options.user || Meteor.user();
    delete options.user;

    if (user && user.services && user.services.google &&
        user.services.google.accessToken) {
      options.headers = options.headers || {};
      options.headers.Authorization = 'Bearer ' + user.services.google.accessToken;

      path = /^http(s)?:\/\//.test(path)?path:this._host + '/' + path;

      HTTP.call(method, this._host + '/' + path, options, function(error, result) {
        callback(error, result && result.data);
      });
    } else {
      callback(new Meteor.Error(403, "Auth token not found." +
        "Connect your google account"));
    }
  },

  _refresh: function(user, callback) {
    Log('GoogleApi._refresh');

    Meteor.call('exchangeRefreshToken', user && user._id, function(error, result) {
      callback(error, result && result.access_token)
    });
  }
}

// setup HTTP verbs
httpVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
_.each(httpVerbs, function(verb) {
  GoogleApi[verb.toLowerCase()] = wrapAsync(function(path, options, callback) {
    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    return this._callAndRefresh(verb, path, options, callback);
  })
});
