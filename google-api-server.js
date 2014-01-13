var Future = Npm.require('fibers/future');

var wrapPromise = function(promise) {
  var future = new Future;
  promise
    .then(future.return)
    .fail(future.throw);
  
  future.wait();
}

GoogleApi = {
  get: function(path, params) {
    return wrapPromise(GoogleApiPromised.get(path, params));
  },
  
  post: function(path, params) {
    return wrapPromise(GoogleApiPromised.post(path, params));
  }
}
