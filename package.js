Package.describe({
  summary: "A promises based library to interact with Google's API"
});

Package.on_use(function (api, where) {
  api.use(['http', 'livedata', 'google', 'q', 'accounts-base', 'underscore']);
  
  api.add_files('google-api-common.js', 'client');
  api.add_files('google-api-client.js', ['client']);
  api.add_files('google-api-async.js', 'server');
  api.add_files(['google-api-methods.js', 'google-api-server.js'], ['server']);
  
  api.export('GoogleApi', ['client', 'server']);
});

Package.on_test(function (api) {
  api.use(['google-api', 'tinytest', 'http', 'accounts-base', 'service-configuration']);

  api.add_files('google-api-tests.js', ['client', 'server']);
});
