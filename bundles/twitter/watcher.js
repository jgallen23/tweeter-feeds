var mongoose = require('mongoose');
var winston = require('winston');
var config = require('confi').load();
var Twitter = require('twitter');
var Tweet = require('./models/tweet');
var User = require('./models/user');

mongoose.connect(config.mongo);
var friends = {};

var watch = function(user) {
  winston.info("Watcher: Started "+user.screenName);
  var twit = new Twitter({
    consumer_key: config.twitter.consumerKey,
    consumer_secret: config.twitter.consumerSecret,
    access_token_key: user.accessToken,
    access_token_secret: user.accessTokenSecret
  });

  var startWatcher = function() {
    twit.stream('user', function(stream) {
      winston.info('Watcher: Stream Started');
      stream.on('data', function(data) {
        if (!friends[user.screenName]) {
          friends[user.screenName] = data;
        } else {
          Tweet.addTweet(data, user);
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
        winston.info('Watcher: Timline Fetched '+timeline.length+' Tweets');
        for (var i = 0, c = timeline.length; i < c; i++) {
          var tweet = timeline[i];
          Tweet.addTweet(tweet, user);
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
        include_entities: 1,
        page: page
      };
      if (lastId)
        req.since_id = parseInt(lastId.toString(), 10);
      winston.info('Watcher: Fetching Timeline '+page);
      twit.getHomeTimeline(req, saveTimeline);
    };
    
    Tweet.findLatest(user, function(err, tweet) {
      if (tweet) {
        winston.info('Watcher: Latest Tweet', tweet.toJSON());
        lastId = tweet.tweetId;
      }
      fetchTimeline();
    });
  };

  getTimeline(function() {
    startWatcher();
  });
};
User.find({}, function(err, users) {
  for (var i = 0, c = users.length; i < c; i++) {
    var user = users[i];
    winston.info('Watcher: Watching User: '+user.screenName+' ('+user._id.toString()+')');
    watch(user);
  }
});
User.schema.post('save', function() {
  watch(this);
});
