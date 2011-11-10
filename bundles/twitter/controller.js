var config = require('confi').load();
var OAuth = require('oauth').OAuth;

module.exports = function(app, namespace) {
 var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    config.twitter.consumerKey,
    config.twitter.consumerSecret,
    "1.0",
    config.host+"/auth/twitter/callback",
    "HMAC-SHA1"
 ); 
};
