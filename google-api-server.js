var Future = Npm.require('fibers/future');

var wrapPromise = function(promise) {
  var future = new Future;
  promise
    .then(Meteor.bindEnvironment(function(data) { future.return(data); }, 
      'Google API Complete Callback'))
    .fail(Meteor.bindEnvironment(function(error) { future.throw(error); },
      'Google API Failed Callback'));
  
  return future.wait();
}

GoogleApi = {
  get: function(path, params) {
    return wrapPromise(GoogleApiPromised.get(path, params));
  },
  
  post: function(path, params) {
    return wrapPromise(GoogleApiPromised.post(path, params));
  }
}
