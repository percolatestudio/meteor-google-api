GoogleApi = {
  get: Q.denodeify(_.bind(GoogleApiAsync.get, GoogleApiAsync)),
  
  post: Q.denodeify(_.bind(GoogleApiAsync.post, GoogleApiAsync))
}
