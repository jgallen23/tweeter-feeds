var winston = require('winston');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var User = new Schema({
  twitterId: { type: Number, unique: true },
  screenName: String,
  accessToken: String,
  accessTokenSecret: String
});

User.statics = {
  findByScreenName: function(screenName, callback) {
    return this.findOne({ screenName: screenName }, callback);
  },
  findByTwitterId: function(id, callback) {
    return this.findOne({ twitterId: id }, callback);
  },
  getOrCreate: function(id, screenName, oauthAccessToken, oauthAccessTokenSecret, callback) {
    var self = this;
    this.findByTwitterId(id, function(err, user) {
      if (user) {
        user.accessToken = oauthAccessToken;
        user.accessTokenSecret = oauthAccessTokenSecret;
        user.save(callback);
      } else {
        self.create({
          twitterId: id,
          screenName: screenName,
          accessToken: oauthAccessToken,
          accessTokenSecret: oauthAccessTokenSecret
        }, callback);
      }
    }); 
  }
};
module.exports = mongoose.model('twitterUser', User);
