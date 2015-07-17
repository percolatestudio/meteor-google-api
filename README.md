Google API
----------

A Meteor library to interact with Google's API.

Works with accounts-google to automatically handle refresh/access token changes and give you a simple API to make calls.

# Install

```
meteor add percolate:google-api
```

# Usage

To call the library, use the `get()` and `post()` functions:

```
GoogleApi.get('/your/api/path', options[, callback]);
```

If `callback` is provided (client or server), the call will be made **asynchronously**. 

Available methods: `GoogleApi.get`, `GoogleApi.post`, `GoogleApi.patch`, `GoogleApi.put`, `GoogleApi.delete`

`GoogleApi` is a Google OAuth authentication wrapper around `HTTP`, so it takes the same arguments. For example, to pass a JSON body in `GoogleApi.post`, use:

````javascript
GoogleApi.post('/your/api/path', { data: jsonBody });
````

On the client, if you do not provide a callback, the library will return a [Q promise](https://github.com/kriskowal/q). On the server, it will run **synchronously**.

If the user's access token has expired, it will transparently call the `exchangeRefreshToken` method to get a new refresh token. To call this method manually (e.g. from other Google API packages), use `Meteor.call('exchangeRefreshToken'[, userId])`. You should first check that that the user's token has actually expired, though, since this method won't.

# Contributions

Are welcome.
