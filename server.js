(function() {
  var TweetDb, app, db, express, mongodb;
  express = require("express");
  TweetDb = require("./tweetdb");
  app = express.createServer();
  mongodb = require('mongodb');
  db = null;
  app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.set("views", "" + __dirname + "/templates");
    app.set("view options", {
      layout: false
    });
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  app.get("/:user", function(req, res) {
    var user;
    user = req.params.user;
    return db.getLists(user, function(results) {
      return res.render("lists.jade", {
        user: user,
        lists: results
      });
    });
  });
  app.get("/feeds/:user", function(req, res) {
    var user;
    user = req.params.user;
    return db.getTweets(40, function(results) {
      return res.render("feed.jade", {
        user: user,
        tweets: results,
        listName: 'All Tweets'
      });
    });
  });
  app.get("/feeds/:user/:listId", function(req, res) {
    var listId, user;
    res.local("formatDate", function(date) {
      return new Date(date).toISOString();
    });
    user = req.params.user;
    listId = parseInt(req.params.listId, 10);
    return db.getTweetsFromList(user, listId, function(list, results) {
      return res.render("feed.jade", {
        user: user,
        tweets: results,
        listName: list.name
      });
    });
  });
  db = new TweetDb;
  db.on("ready", function() {
    return app.listen(3000, "0.0.0.0");
  });
}).call(this);
