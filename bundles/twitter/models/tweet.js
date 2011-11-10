var winston = require('winston');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var Tweet = new Schema({
  text: String,
  tweetId: { type: Number, unique: true },
  created: Date,
  user: {
    name: String,
    screenName: String,
    id: String,
    avatar: String
  }
});

Tweet.statics = {
  addTweet: function(t) {
    this.create({
      tweetId: t.id,
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
  findLatest: function(callback) {
    this.findOne().desc('created').run(callback);
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
