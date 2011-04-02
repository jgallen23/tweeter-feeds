startServer = ->
  nub = require "./nubnub/src/server"
  express = require "express"
  TweetDb = require "./tweetdb"
  dateFormat = require 'dateformat'
  app = express.createServer()
  db = null
  port = 80

  app.configure ->
    app.use express.logger()
    app.use express.methodOverride()
    app.use express.bodyParser()
    app.use app.router

    app.set "views", "#{ __dirname }/templates"
    app.set "view options", { layout: false }

    app.helpers {
      urlize: (str) ->
        str = str.replace /(https?:.*?)($| )/g, "<a href='$1' target='_blank'>$1</a> "
        str = str.replace />http:\/\/twitpic.com\/(.*?)</, "><img src='http://twitpic.com/show/thumb/$1' /><"
        return str
      dateFormat: (date, offset) ->
        utc = date.getTime() + (date.getTimezoneOffset() * 60000)
        nd = new Date(utc + (3600000 * offset))
        return dateFormat nd, "dddd, mmmm dS, h:MM:ss TT"
      }

      


  app.configure "development", ->
    port = 3000
    app.use express.errorHandler { dumpExceptions: true, showStack: true }

  app.configure "production", ->
    app.use express.errorHandler()


  app.get "/", (req, res) ->
    res.end "Hi"

  app.all "/hub", (req, res) ->
    console.log req.rawBody
    sub = nub.subscribe req.rawBody
    console.log sub
    sub.check_verification (err, resp) ->
      if err
        console.log "HUB: Error with validation: #{err}"
      else
        console.log "HUB: Success"

      return
      sub.publish [{abc: 1}], {format: 'json'}, (err, resp) ->
        if err
          console.log "SERVER: Error with publishing:"
          console.log err
        else
          console.log "SERVER: Publishing successful!"

  app.get "/:user", (req, res) ->
    user = req.params.user
    db.getLists user, (results) ->
      res.render "lists.jade", user: user, lists: results

  app.get "/lists/:user", (req, res) ->
    user = req.params.user
    db.getTweets 300, (results) ->
      res.render "list.jade", user: user, tweets: results, listName: 'All Tweets'

  app.get "/feeds/:user", (req, res) ->
    user = req.params.user
    db.getTweets 300, (results) ->
      res.render "feed.jade", user: user, tweets: results, listName: 'All Tweets'


  app.get "/feeds/:user/:listId", (req, res) ->
    res.local "formatDate", (date) ->
      return new Date(date).toISOString()

    user = req.params.user
    listId = parseInt req.params.listId, 10
    db.getTweetsFromList user, listId, (list, results) ->
      res.render "feed.jade", user: user, tweets: results, listName: list.name


  db = new TweetDb
  db.on "ready", ->
    app.listen port, "0.0.0.0"

startTweetWatcher = ->
  require "./watcher"

startReaderRefresher = ->
  GoogleReader = require "./reader"
  reader = new GoogleReader
  check = ->
    reader.login process.env.GOOGLEREADER_EMAIL, process.env.GOOGLEREADER_PASS, ->
      #@unreadCount (counts) ->
        #console.log counts
      console.log "Refresh Google Reader Feed"
      @getFeed "http://jga.no.de/feeds/jgallen23", (data) ->
        #console.log data
  setInterval check, 60 * 60 * 1000 #1 hour
  check()
  


#startTweetWatcher()
#startServer()
startReaderRefresher()
