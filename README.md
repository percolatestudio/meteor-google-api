Google API
----------

A Meteor library to interact with [Google's APIs](https://developers.google.com/apis-explorer/):
AdSense, Analytics, BigQuery, Blogger, Calendar, Compute Engine, Drive, Fusion Tables, Gmail, Google+, Prediction, Translate, and many more.

Works with [accounts-google](https://atmospherejs.com/meteor/accounts-google) to automatically handle refresh/access token changes and give you a simple API to make calls.

# Install

```
meteor add percolate:google-api
```

# Usage

To call the library, use the `get()` and `post()` functions:

```
GoogleApi.get('/your/api/path', options, callback);
```

If `callback` is provided (client or server), the call will be made **asynchronously**. 

On the client, if you do not provide a callback, the library will return a [Q promise](https://github.com/kriskowal/q). On the server, it will run **synchronously**.

If the user's access token has expired, it will transparently call the `exchangeRefreshToken` method to get a new refresh token.

# Contributions

Are welcome.
