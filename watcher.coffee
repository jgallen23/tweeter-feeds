sys = require "sys"
twitter = require "./node-twitter"
mongodb = require('mongodb')
TweetDb = require("./tweetdb")

t = new twitter consumer_key: process.env.TWITTER_CONSUMER_KEY, consumer_secret: process.env.TWITTER_CONSUMER_SECRET, access_token_key: process.env.TWITTER_OATH_TOKEN, access_token_secret: process.env.TWITTER_OATH_SECRET

friends = null
db = new TweetDb

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
		db.addTweet tweet
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

	addMembers = (list, members) ->
		if members.statusCode
			console.log "error", members
			return
		for member in members
			list.users.push member.id
		#save list
		db.addList list


	getMembers = (list) ->
		t.getListMembers user, list.id, (members) ->
			addMembers list, members

	addLists = (lists) ->
		if lists.statusCode
			console.log "error", lists
			return
		for list, i in lists
			console.log list.name
			ulist = owner: user, id: list.id, name: list.name, users: []
			getMembers ulist

	t.getLists user, {}, addLists

getHomeTimeline = (cb) ->
	console.log "Saving timeline"
	saveTimeline = (timeline) ->
		for tweet in timeline
			db.addTweet tweet

	t.getHomeTimeline { count: 200 }, saveTimeline

db.on "ready", ->
	getLists "jgallen23"
	getHomeTimeline()
	watchStream()
	
