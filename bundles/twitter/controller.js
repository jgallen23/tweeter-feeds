var sys = require('sys');
var config = require('confi').load();
var OAuth = require('oauth').OAuth;
var User = require('./models/user');
var urls = require('../../urls');

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

 app.get('/auth/twitter/', function(req, res){
   oa.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
     if (error) {
       res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
     } else {  
       req.session.oauthRequestToken = oauthToken;
       req.session.oauthRequestTokenSecret = oauthTokenSecret;
       res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);      
     }
   });
 });

 app.get('/auth/twitter/callback', function(req, res){
   oa.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
     if (error) {
       res.send("Error getting OAuth access token : " + sys.inspect(error) + "["+oauthAccessToken+"]"+ "["+oauthAccessTokenSecret+"]"+ "["+sys.inspect(results)+"]", 500);
     } else {
       req.session.oauthAccessToken = oauthAccessToken;
       req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
       // Right here is where we would write out some nice user stuff
       oa.get("http://twitter.com/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
         if (error) {
           res.send("Error getting twitter screen name : " + sys.inspect(error), 500);
         } else {
           data = JSON.parse(data);
           User.getOrCreate(data.id, data.screen_name, oauthAccessToken, oauthAccessTokenSecret, 
             function(err, user) {
               req.session.screenName = user.screenName;
               req.session.userId = user._id.toString();
               res.redirect(urls.profile());
             });
         }  
       });  
     }
   });
 });

 app.get('/profile/?:id', function(req, res) {
   var id = req.params.id || req.session.userId;
   if (id) {
     User.findById(id, function(err, user) {
      res.render('profile', {
        user: user
      }); 
     });
   } else {
     res.redirect(urls.homepage());
   }
 });

 app.get('/users/', function(req, res) {
   User.find({}, function(err, users) {
     res.render('users', {
       users: users
     });
   });   
 });
};
