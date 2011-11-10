var express = require("express");
var path = require("path");
var mongoose = require('mongoose');
var relativeDate = require('relative-date');
var argv = require('optimist').argv;
var dateFormat = require('dateformat');
var app = express.createServer();
var port = argv.port || 3000;

var bundle = require("express-bundle").use(app, {
  bundlesDir: 'bundles'
});

var dbUrl = 'mongodb://localhost/tweeter-feeds';
mongoose.connect(dbUrl);

var config = require('confi').load();

app.configure(function() {
  //app.use(express.logger());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());

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
    }
  });
  app.set("views", "" + __dirname + "/views");

  app.set("view options", {
    layout: false 
  });
  app.set("view engine", "jade");
});
app.configure("development", function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});
app.configure("production", function() {
  app.use(express.errorHandler());
});

bundle.register('feed');

//watcher
require('./bundles/twitter/watcher');

console.log("Server started on port "+port);
app.listen(port, "0.0.0.0");
