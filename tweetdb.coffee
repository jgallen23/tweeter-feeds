mongodb = require('mongodb')
EventEmitter = require("events").EventEmitter

class Twit extends EventEmitter
	constructor: () ->
		db2 = new mongodb.Db "twitrss", new mongodb.Server "127.0.0.1", 27017
		db2.open (error, client) =>
			@client = client
			@emit "ready"

	#addTweet
	#addLists

	getLists: (name, cb) ->
		collection = new mongodb.Collection @client, "user_lists"
		collection.find { owner: name }, (err, cursor) ->
			cursor.toArray (err, results) ->
				cb results
	
	getTweetsFromList: (name, listId, cb) ->
		getTweets = (list) ->
			collection = new mongodb.Collection @client, "tweets"
			return
			collection.find { "user_id": { $in: [48849410] } }, (err, cursor) ->
				cursor.toArray (err, results) ->
					cb results

		collection = new mongodb.Collection @client, "user_lists"
		collection.findOne { owner: name, name: listId }, (err, result) ->
			getTweets result

module.exports = Twit

t = new Twit
t.on "ready", ->
	@getTweetsFromList "jgallen23", "sports", (results) ->
		console.log results
