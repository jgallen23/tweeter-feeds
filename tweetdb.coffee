mongodb = require('mongodb')
EventEmitter = require("events").EventEmitter

class TweetDb extends EventEmitter
	constructor: () ->
		@db = new mongodb.Db "tweeterfeeds", new mongodb.Server "127.0.0.1", 27017
		@db.open (error, client) =>
			@client = client
			@emit "ready"

	addTweet: (tweet) ->
		data =
			_id: tweet.id
			text: tweet.text
			created: new Date(tweet.created_at)
			user_name: tweet.user.name
			user_screen_name: tweet.user.screen_name
			user_id: tweet.user.id
			user_avatar: tweet.user.profile_image_url
		collection = new mongodb.Collection @client, 'tweets'
		collection.save data, (err, objects) ->
	addList: (list) ->
		collection = new mongodb.Collection @client, 'lists'
		collection.save list, (err, objects) ->
			#cb userLists

	getLists: (name, cb) ->
		collection = new mongodb.Collection @client, "lists"
		collection.find { owner: name }, (err, cursor) ->
			cursor.toArray (err, results) ->
				cb results
	getTweets: (limit, cb) ->
		if !limit
			limit = 40
		collection = new mongodb.Collection @client, "tweets"
		collection.find {}, { limit: limit, sort: [['created', 'desc']] }, (err, cursor) ->
			cursor.toArray (err, results) ->
				cb results
	
	getTweetsFromList: (name, listId, cb) ->
		self = @
		getTweets = (list) ->
			collection = new mongodb.Collection self.client, "tweets"
			collection.find { "user_id": { $in: list.users } }, { sort: [['created', 'desc']] }, (err, cursor) ->
				cursor.toArray (err, results) ->
					cb list, results

		collection = new mongodb.Collection @client, "lists"
		collection.findOne { owner: name, id: listId }, (err, result) =>
			getTweets result

if !module.parent
	t = new TweetDb
	t.on "ready", ->
		#@getTweetsFromList "jgallen23", "sports", (results) ->
		@getTweets (results) ->
			console.log results
else
	module.exports = TweetDb

