startServer = ->
	express = require "express"
	TweetDb = require "./tweetdb"
	app = express.createServer()
	db = null
	port = 80

	app.configure ->
		app.use express.methodOverride()
		app.use express.bodyParser()
		app.use app.router

		app.set "views", "#{ __dirname }/templates"
		app.set "view options", { layout: false }

		app.helpers {
			urlize: (str) ->
				str = str.replace /(http:.*?)($| )/g, "<a href='$1' target='_blank'>$1</a> "
				return str
			}


	app.configure "development", ->
		port = 3000
		app.use express.errorHandler { dumpExceptions: true, showStack: true }

	app.configure "production", ->
		app.use express.errorHandler()


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
		app.listen port, "0.0.0.0"

startWatcher = ->
	require "./watcher"

startWatcher()
startServer()
