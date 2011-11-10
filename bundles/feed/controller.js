var User = require('../twitter/models/user');
var Tweet = require('../twitter/models/tweet');

module.exports = function(app, namespace) {
  var limit = 100;
  app.get("/feed/_user/:screenName", function(req, res) {
    User.findByScreenName(req.params.screenName, function(err, user) {
      Tweet.findByUser(user, limit, function(err, tweets) {
        res.contentType('text/xml');
        res.render('feed', {
          user: user.screenName,
          tweets: tweets,
          listName: 'All Tweets'
        });
      });
    });
  });
  app.get('/feed/:id', function(req, res) {
    var id = req.params.id;
    User.findById(id, function(err, user) {
      Tweet.findByUser(user, limit, function(err, tweets) {
        res.contentType('text/xml');
        res.render('feed', {
          user: user.screenName,
          tweets: tweets,
          listName: 'All Tweets'
        });
      });
    });
  });
  app.get('/list/:id', function(req, res) {
    var id = req.params.id;
    User.findById(id, function(err, user) {
      console.log(id);
      console.log(user);
      Tweet.findByUser(user, limit, function(err, tweets) {
        res.render('list', {
          user: user.screenName,
          tweets: tweets,
          listName: 'All Tweets'
        });
      });
    });
  });
};
