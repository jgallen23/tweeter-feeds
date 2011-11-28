var winston = require('winston');
var express = require("express");
var path = require("path");
var mongoose = require('mongoose');
var relativeDate = require('relative-date');
var argv = require('optimist').argv;
var dateFormat = require('dateformat');
var app = express.createServer();
var port = argv.port || 80;

var bundle = require("express-bundle").use(app, {
  bundlesDir: 'bundles'
});

winston.default.transports.console.timestamp = true;
var config = require('confi').load();
mongoose.connect(config.mongo);

app.configure(function() {
  app.use(express.logger());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'twwwwwwweeet' }));

  app.helpers({
    inProduction: (process.env.NODE_ENV === 'production'),
    config: config,
    relativeDate: relativeDate,
    urlize: function(str, images) {
      str = str.replace(/(https?:.*?)($| )/g, "<a href='$1' target='_blank'>$1</a>");
      if (images)
        str = str.replace(/>http:\/\/twitpic.com\/(.*?)</, "><img style='display: block' src='http://twitpic.com/show/thumb/$1' /><");
      return str;
    },
    dateFormat: function(date, offset) {
      var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      var nd = new Date(utc + (3600000 * offset));
      return dateFormat(nd, "dddd, mmmm dS, h:MM:ss TT");
    },
    urls: require('./urls')
  });
  app.dynamicHelpers({
    session: function(req, res) {
      return req.session;
    }
  });
  app.set("views", "" + __dirname + "/views");

  app.set("view options", {
    layout: false 
  });
  app.set("view engine", "jade");
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.get("/", function(req, res) {
  res.render('homepage');
});

bundle.register('feed');
bundle.register('twitter');

//watcher
require('./bundles/twitter/watcher');
require('./bundles/reader-refresh');

console.log("Server started on port "+port);
app.listen(port, "0.0.0.0");
