// Object for calling Google's restful APIs (GAPI's)
//
// This object uses a promise based API, which works well on the client
//
// On the server, we prefer a sync API, so we "un-promise" it.
GoogleApiPromised = {
  // host component, shouldn't change
  _host: 'https://www.googleapis.com',
  
  // Performs a GET against the google API specified by path with params
  // returns: a jQuery promise.
  //
  // Will retry with a refreshed token if the call appears to fail due to tokens
  //
  // XXX: todo, is it safe to assume that services.google.authToken will exist
  // after a successful refresh?? (it appears to always work, hehe :)
  get: function(path, options) {
    return this._callAndRefresh('GET', path, options);
  },
  
  // XXX: do I add all of these? 
  post: function(path, options) {
    return this._callAndRefresh('POST', path, options);
  },
  
  _callAndRefresh: function(method, path, options) {
    var self = this;
    
    return self._call(method, path, options).then(function() {
      return this;
    
    }, function(error) {
      if (error.response && error.response.statusCode == 401) {
        console.log('google-api attempting token refresh');

        return self._refresh().then(function() {
          return self._call(method, path, options);
        });
      }
      return this;
    });
  },
  
  // wraps a GAPI Meteor.http call in a jQuery promise.
  _call: function(method, path, options) {
    console.log('GoogleApi._call, path:' + path);

    var deferred = new Q.defer();

    if (Meteor.user().services &&
        Meteor.user().services.google &&
        Meteor.user().services.google.accessToken) {
      
      options = options || {};
      options.headers = options.headers || {};
      options.headers.Authorization = 'Bearer ' + Meteor.user().services.google.accessToken;
      
      HTTP.call(method, this._host + '/' + path, options, function(error, result) {
          if (error) {
            deferred.reject(error);
          } else {
            deferred.resolve(result.data, result);
          }
        }
      );
    } else {
      // XXX: perhaps we can ask them to log in here
      deferred.reject(new Meteor.Error(403, "Auth token not found." +
        "Connect your google account"));
    }

    return deferred.promise;
  },

  // wraps a token refresh call in a jQuery promise.
  _refresh: function() {
    console.log('GoogleApi._refresh');

    var deferred = new Q.defer();

    Meteor.call('exchangeRefreshToken', function(error, result) {
      if (error) {
        deferred.reject(error);
      } else {
        deferred.resolve(result.access_token);
      }
    });

    return deferred.promise;
  }
}