// XXX: ideally we'd use the google-api-common, but there's no jquery
// and thus deferred on the server.
//
// If we can figure out a non-spaghetti way to use a promise on the server,
// let's do that so we share code
GoogleApi = {
  get: function(path, params) {
    return this._callAndRefresh('GET', path, params);
  },
  
  _callAndRefresh: function(method, path, params) {
    try {
      return this._call(method, path, params);
    } catch (error) {
      if (error.response && error.response.statusCode == 401) {
        console.log('google-api attempting token refresh');
        
        this._refresh()
        return this._call(method, path, params);
      } else {
        throw error;
      }
    }
  },
  
  // wraps a GAPI Meteor.http call in a jQuery promise.
  _call: function(method, path, params) {
    console.log('GoogleApi._call, path:' + path);
    
    if (Meteor.user().services &&
        Meteor.user().services.google &&
        Meteor.user().services.google.accessToken) {
      
      return HTTP.call(method, GoogleApiPromised._host + '/' + path, {
        params: params,
        headers: {
          'Authorization': 'Bearer ' + Meteor.user().services.google.accessToken
        }
      }).data;
    } else {
      throw new Meteor.Error(403, "Auth token not found." +
        "Connect your google account");
    }
  },

  // wraps a token refresh call in a jQuery promise.
  _refresh: function() {
    console.log('GoogleApi._refresh');
    Meteor.call('exchangeRefreshToken');
  }
}
