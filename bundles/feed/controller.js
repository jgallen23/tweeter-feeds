var Tweet = require('../twitter/models/tweet');

module.exports = function(app, namespace) {
  var limit = 100;
  app.get('/feed', function(req, res) {
    Tweet.find().desc('created').limit(limit).run(function(err, tweets) {
      res.contentType('text/xml');
      res.render('feed', {
        user: 'jgallen23',
        tweets: tweets,
        listName: 'All Tweets'
      });
    });
  });
  app.get('/list', function(req, res) {
    Tweet.find().desc('created').limit(limit).run(function(err, tweets) {
      res.render('list', {
        user: 'jgallen23',
        tweets: tweets,
        listName: 'All Tweets'
      });
    });
  });
};
