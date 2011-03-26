express = require "express"
TweetDb = require("./tweetdb")
app = express.createServer()

mongodb = require('mongodb')
db = null

app.configure () ->
	app.use express.methodOverride()
	app.use express.bodyParser()
	app.use app.router

	app.set "views", "#{ __dirname }/templates"
	app.set "view options", { layout: false }

	app.use express.errorHandler { dumpExceptions: true, showStack: true }
 

app.get "/", (req, res) ->
	res.end "Hi"

app.get "/:user", (req, res) ->
	user = req.params.user
	db.getLists user, (results) ->
		res.render "lists.jade", user: user, lists: results

app.get "/feeds/:user", (req, res) ->
	user = req.params.user
	db.getTweets 40, (results) ->
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
	app.listen 3000, "0.0.0.0"
