Package.describe({
  summary: "A promises based library to interact with Google's API"
});

Package.on_use(function (api, where) {
  api.use(['http', 'livedata', 'google', 'jquery', 'accounts-base']);
  
  api.add_files('google-api-common.js', ['client', 'server']);
  api.add_files('google-api-client.js', ['client']);
  api.add_files(['google-api-methods.js', 'google-api-server.js'], ['server']);
  
  api.export('GoogleApi', ['client', 'server']);
});

Package.on_test(function (api) {
  api.use(['google-api', 'tinytest', 'http', 'accounts-base']);

  api.add_files('google-api-tests.js', ['client', 'server']);
});
