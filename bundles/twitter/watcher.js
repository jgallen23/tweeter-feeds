var mongoose = require('mongoose');
var winston = require('winston');
var config = require('confi').load();
var Twitter = require('twitter');
var Tweet = require('./models/tweet');

mongoose.connect(config.mongo);
var friends = null;

var twit = new Twitter({
  consumer_key: config.twitter.consumerKey,
  consumer_secret: config.twitter.consumerSecret,
  access_token_key: config.twitter.accessTokenKey,
  access_token_secret: config.twitter.accessTokenSecret
});

var startWatcher = function() {
  twit.stream('user', function(stream) {
    winston.info('Watcher: Stream Started');
    stream.on('data', function(data) {
      if (!friends) {
        friends = data;
      } else {
        Tweet.addTweet(data);
      }
    });
    stream.on('error', function(error) {
      winston.error('Watcher', error);
    });
    stream.on('end', function() {
      winston.error('Watcher: Stream End');
    });
  });
};

var getTimeline = function(callback) {
  winston.info('Watcher: Get Timeline');
  var page = 1;
  var lastId = null;
  var tweetsAdded = 0;
  var saveTimeline = function(timeline) {
    winston.info('Watcher: Save Timeline');
    if (timeline instanceof Array) {
      for (var i = 0, c = timeline.length; i < c; i++) {
        var tweet = timeline[i];
        Tweet.addTweet(tweet);
      }
      tweetsAdded += timeline.length;
      if (lastId && timeline.length !== 0) {
        fetchTimeline(++page);
      } else {
        winston.info('Watcher: Timeline Fetch Complete', { tweets: tweetsAdded });
        callback();
      }
    } else {
      winston.error('Watcher: Error',  timeline);
    }
  };
  var fetchTimeline = function() {
    var req = {
      count: 200,
      page: page
    };
    if (lastId)
      req.since_id = lastId.toString();
    winston.info('Watcher: Fetching Timeline '+page);
    twit.getHomeTimeline(req, saveTimeline);
  };
  
  Tweet.findLatest(function(err, tweet) {
    winston.info('Watcher: Latest Tweet', tweet.toJSON());
    lastId = tweet.tweetId;
    fetchTimeline();
  });
};

getTimeline(function() {
  startWatcher();
});
