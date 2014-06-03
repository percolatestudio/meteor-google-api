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
    options = options || {};
    
    return self._call(method, path, options).fail(
      // need to bind the env here so we can do mongo writes in the callback 
      // (when refreshing), if we call this on the server
      Meteor.bindEnvironment(function(error) {
        if (error.response && error.response.statusCode == 401) {
          console.log('google-api attempting token refresh');

          return self._refresh(options.user).then(function() {
            return self._call(method, path, options);
          });
        }
      
        // else..
        throw error;
      
      // if we throw an error, *we actually want it to throw*, q will catch it
      }, function(error) { throw error }));
  },
  
  // wraps a GAPI Meteor.http call in a jQuery promise.
  _call: function(method, path, options) {
    console.log('GoogleApi._call, path:' + path);
    
    options = options || {};
    var deferred = Q.defer();
    var user = options.user || Meteor.user();
    
    if (user && user.services && user.services.google && 
        user.services.google.accessToken) {
      options.headers = options.headers || {};
      options.headers.Authorization = 'Bearer ' + user.services.google.accessToken;
    
      HTTP.call(method, this._host + '/' + path, options, function(error, result) {
        if (error) {
          deferred.reject(error);
        } else {
          deferred.resolve(result.data);
        }
      });
    } else {
      deferred.reject(new Meteor.Error(403, "Auth token not found." +
        "Connect your google account"));
    }
    
    return deferred.promise;
  },

  // wraps a token refresh call in a jQuery promise.
  _refresh: function(user) {
    console.log('GoogleApi._refresh');

    var deferred = Q.defer();

    Meteor.call('exchangeRefreshToken', user && user._id, function(error, result) {
      if (error) {
        deferred.reject(error);
      } else {
        deferred.resolve(result.access_token);
      }
    });

    return deferred.promise;
  }
}