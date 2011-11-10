var mongoose = require('mongoose');
var GoogleReader = require('./reader');
var User = require('../twitter/models/user');
var winston = require('winston');
var config = require('confi').load();
var urls = require('../../urls');

mongoose.connect(config.mongo);
var reader = null;

var refreshFeed = function(feedUrl) {
  reader.getFeed(feedUrl, function(data) {
    winston.info("GR Feed Refreshed: "+feedUrl);
  });
};
var refreshAll = function() {
  User.find({}, function(err, users) {
    for (var i = 0, c = users.length; i < c; i++) {
      var user = users[i];
      var feedUrl = config.host+urls.rssFeed(user);
      refreshFeed(feedUrl);
    }
  });
};

var startAutoRefresh = function() {
  setInterval(refreshAll, config.googleReader.refreshRate*1000*60);
  refreshAll();
};

if (config.googleReader) {
  reader = new GoogleReader();    
  reader.login(config.googleReader.email, config.googleReader.pass, function() {
    winston.info('GR Logged In');
    setTimeout(startAutoRefresh, 1000*60);//delay 1 min
  });
}

module.exports = function(app) {
};
