var User = require('../twitter/models/user');
var Tweet = require('../twitter/models/tweet');

module.exports = function(app, namespace) {
  var limit = 300;
  app.get('/feed/:id.:format', function(req, res) {
    var id = req.params.id;
    var format = req.params.format;
    var l = req.query.limit || limit;
    User.findById(id, function(err, user) {
      Tweet.findByUser(user, l, function(err, tweets) {
        if (format == "rss")
          res.contentType('text/xml');
        res.render(format, {
          user: user.screenName,
          tweets: tweets,
          listName: 'All Tweets'
        });
      });
    });
  });
};
