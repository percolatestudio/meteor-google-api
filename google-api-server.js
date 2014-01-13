var Future = Npm.require('fibers/future');

var wrapPromise = function(promise) {
  var future = new Future;
  promise
    .then(function(data) { future.return(data); })
    .fail(function(error) { future.throw(error); });
  
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
