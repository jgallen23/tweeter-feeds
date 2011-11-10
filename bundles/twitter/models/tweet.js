var winston = require('winston');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var Tweet = new Schema({
  text: String,
  tweetId: { type: Number },
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

Tweet.statics = {
  addTweet: function(t, timelineUser) {
    //console.log(t);
    this.create({
      tweetId: t.id,
      timelineUser: timelineUser,
      text: t.text,
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
    this.findOne({ timelineUser: timelineUser }).desc('created').run(callback);
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
