express = require "express"
Twit = require("./twit")
app = express.createServer()

mongodb = require('mongodb')
db = new mongodb.Db "twitrss", new mongodb.Server "127.0.0.1", 27017
twit = null

app.configure () ->
	app.use express.methodOverride()
	app.use express.bodyParser()
	app.use app.router

	app.set "views", "#{ __dirname }/templates"
	app.set "view options", { layout: false }

	app.use express.errorHandler { dumpExceptions: true, showStack: true }
 

app.get "/:user/", (req, res) ->
	user = req.params.user
	twit.getLists user, (results) ->
		console.log results
		res.render "lists.jade", user: user, lists: results

app.get "/rss/:user/:listId", (req, res) ->
	user = req.params.user
	listId = parseInt req.params.listId, 10
	twit.getTweetsFromList user, listId, (results) ->
		res.render "rss.jade", user: user, tweets: results

db.open (error, client) ->
	twit = new Twit client
	#getTweetsFromList "jgallen23", "ee", (results) ->
	app.listen 3000
