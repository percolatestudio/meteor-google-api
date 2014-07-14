var syncUnlessCallbackProvided = function(fn) {
  return function(/* arguments */) {
    var args = _.toArray(arguments);
    if (_.isFunction(args[args.length - 1]))
      return fn.apply(this, args);
    else
      return Meteor._wrapAsync(fn).apply(this, args);
  }
}

GoogleApi = {
  get: syncUnlessCallbackProvided(_.bind(GoogleApiAsync.get, GoogleApiAsync)),
  
  post: syncUnlessCallbackProvided(_.bind(GoogleApiAsync.post, GoogleApiAsync))
}
