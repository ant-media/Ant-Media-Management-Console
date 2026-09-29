const fs = require('fs');
const browserConfigFile = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js';
const karmaPluginFile = 'node_modules/@angular-devkit/build-angular/src/angular-cli-files/plugins/karma.js';

fs.readFile(browserConfigFile, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/node: false/g, 'node: {crypto: true, stream: true}');

  fs.writeFile(browserConfigFile, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});

fs.readFile(karmaPluginFile, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  var result = data.replace(
    'const webpackReq = { ...req, url: webpackUrl };',
    'const webpackReq = { ...req, url: webpackUrl, headers: req.headers || {} };'
  );

  fs.writeFile(karmaPluginFile, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
