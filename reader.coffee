sys = require "sys"
config = require("./config").config
#twitter = require 'twitter'
twitter = require "./node-twitter"
mongodb = require('mongodb')

t = new twitter consumer_key: config.consumerKey, consumer_secret: config.consumerSecret, access_token_key: config.oathToken, access_token_secret: config.oathSecret

db = new mongodb.Db "twitrss", new mongodb.Server "127.0.0.1", 27017

client = null
friends = null

watchStream = ->
	console.log "Start Watching Stream"

	printTweet = (tweet) ->
		console.log "#{ tweet.user.screen_name }: #{ tweet.text }"

	addTweet = (tweet) ->
		#partOfList = false
		#for id, list in userLists
			#if list.users.contains tweet.user.id
				#partOfList = true
				#tweet.listId = id

		#save in mongo
		data =
			_id: tweet.id
			text: tweet.text
			user:
				name: tweet.user.name
				screen_name: tweet.user.screen_name
				id: tweet.user.id
		collection = new mongodb.Collection client, 'tweets'
		collection.save data, (err, objects) ->
		printTweet tweet

	t.stream 'user', (stream) ->
		stream.on 'data', (data) ->
			if !friends
				friends = data
			else
				addTweet data
		
		stream.on "error", (error) ->
			console.log error


getLists = (user, cb) ->
	console.log "Getting user lists"
	userLists = {}
	currentListIndex = 0
	listCount = 0

	saveLists = ->
		#save
		collection = new mongodb.Collection client, 'user_lists'
		l = _id: user, lists: userLists
		collection.save l, (err, objects) ->
			#cb userLists

	addMembers = (id, members) ->
		if members.statusCode
			console.log "error", members
			return
		for member in members
			userLists[id].users.push member.id
		currentListIndex++
		if currentListIndex == listCount
			saveLists()

	getMembers = (id) ->
		t.getListMembers user, id, (members) ->
			addMembers id, members

	addLists = (lists) ->
		listCount = lists.length
		if lists.statusCode
			console.log "error", lists
			return
		for list, i in lists
			userLists[list.id] = name: list.name, users: []
			getMembers list.id

	t.getLists user, {}, addLists

db.open (error, c) ->
	client = c
	#getLists "jgallen23"
	watchStream()
	
