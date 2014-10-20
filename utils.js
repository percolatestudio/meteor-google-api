// wrap an async function for client + server.
//
// 1. if callback is provided, simply provide the async version
//
// 2i. else on the server, run sync
// 2ii. else on the client, return a promise

var wrap = Meteor.wrapAsync || Meteor._wrapAsync;

wrapAsync = function(fn) {
  return function(/* arguments */) {
    var args = _.toArray(arguments);
    if (_.isFunction(args[args.length - 1])) {
      return fn.apply(this, args);
    } else {
      if (Meteor.isClient) {
        return Q.nfapply(_.bind(fn, this), args);
      } else {
        return wrap(fn).apply(this, args);
      }
    }
  }
}
