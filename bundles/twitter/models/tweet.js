var winston = require('winston');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var Tweet = new Schema({
  text: String,
  tweetId: String,
  timelineUser: { type: ObjectId, ref: 'twitterUser' },
  created: Date,
  user: {
    name: String,
    screenName: String,
    id: String,
    avatar: String
  }
});
Tweet.index({ tweetId: -1, timelineUser: -1 }, { unique: true });
Tweet.index({ created: -1 });

var parseEntities = function(tweet) {
  if (!tweet.entities)
    return tweet.text;
  var replace = function(text, start, stop, replace) {
    return text.replace(text.substr(start, stop-start), replace);
  };
  var text = tweet.text;
  for (var i = 0, c = tweet.entities.urls.length; i < c; i++) {
    var url = tweet.entities.urls[i];
    text = replace(text, url.indices[0], url.indices[1], url.expanded_url || url.display_url || url.url);
  }
  return text;
};

Tweet.statics = {
  addTweet: function(t, timelineUser) {
    //console.log(t);
    if (!t.user)
      console.log(t);
    console.log(t.entities);
    this.create({
      tweetId: t.id_str,
      timelineUser: timelineUser,
      text: parseEntities(t),
      created: new Date(t.created_at),
      user: {
        name: t.user.name,
        screenName: t.user.screen_name,
        id: t.user.id,
        avatar: t.user.profile_image_url
      }
    }, function(err, tweet) {
    });
  },
  findByUser: function(timelineUser, limit, callback) {
    this.find({ timelineUser: timelineUser }).limit(limit).desc('created').run(callback);
  },
  findLatest: function(timelineUser, callback) {
    this.find({ timelineUser: timelineUser }).limit(1).desc('created').run(function(err, tweets) {
      callback(err, tweets[0]);
    });
  }
};

Tweet.methods = {
  toJSON: function() {
    return {
      text: this.text,
      tweetId: this.tweetId.toString(),
      user: this.user.screenName
    };
  }
};

Tweet.post('save', function() {
  winston.info("Tweet Added", this.toJSON());
});

module.exports = mongoose.model('Tweet', Tweet);
