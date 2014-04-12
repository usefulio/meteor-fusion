Package.describe({
  summary: 'Fuse Your Meteor App with An Existing Page'
});

Package.on_use(function (api) {
  api.use('underscore', 'server');
  api.use('meteor', 'server');
  api.use('webapp', 'server');
  api.use('livedata', 'server');
  // server only
  api.add_files('fusion.js', 'server');
});