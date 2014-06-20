GoogleApi = {
  get: Meteor._wrapAsync(_.bind(GoogleApiAsync.get, GoogleApiAsync)),
  
  post: Meteor._wrapAsync(_.bind(GoogleApiAsync.post, GoogleApiAsync))
}
