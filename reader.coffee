sys = require "sys"
config = require("./config").config
#twitter = require 'twitter'
twitter = require "./node-twitter"
mongodb = require('mongodb')

t = new twitter consumer_key: config.consumerKey, consumer_secret: config.consumerSecret, access_token_key: config.oathToken, access_token_secret: config.oathSecret

db = new mongodb.Db "twitrss", new mongodb.Server "127.0.0.1", 27017

client = null
friends = null

watchStream = (userLists) ->
	console.log "Start Watching Stream"
	return

	printTweet = (tweet) ->
		console.log "#{ tweet.user.screen_name }: #{ tweet.text }"

	addTweet = (tweet) ->
		#partOfList = false
		#for id, list in userLists
			#if list.users.contains tweet.user.id
				#partOfList = true
				#tweet.listId = id

		#save in mongo
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
		l = name: user, lists: userLists
		collection.insert l, safe: true, (err, objects) ->
			cb userLists

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
			userLists[list.id] = list: list, users: []
			getMembers list.id

	t.getLists user, {}, addLists

db.open (error, c) ->
	client = c
	getLists "jgallen23", watchStream
	
