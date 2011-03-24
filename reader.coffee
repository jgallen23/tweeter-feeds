sys = require "sys"
config = require("./config").config
#twitter = require 'twitter'
twitter = require "./node-twitter"
t = new twitter consumer_key: config.consumerKey, consumer_secret: config.consumerSecret, access_token_key: config.oathToken, access_token_secret: config.oathSecret

friends = null


watchStream = ->
	t.stream 'user', (stream) ->
		console.log "start stream"
		stream.on 'data', (data) ->
			if !friends
				friends = data
			else
				user = data.user.screen_name
				text = data.text
				console.log "#{ user }: #{ text }"
		
		stream.on "error", (error) ->
			console.log error


getLists = (user, cb) ->
	userLists = {}
	currentListIndex = 0
	listCount = 0

	addMembers = (id, members) ->
		if members.statusCode
			console.log "error", members
			return
		for member in members
			userLists[id].push member.id
		if currentListIndex == listCount
			cb userLists

	getMembers = (id) ->
		console.log "get members"
		t.getListMembers user, id, (members) ->
			addMembers id, members

	addLists = (lists) ->
		listCount = lists.length
		if lists.statusCode
			console.log "error", lists
			return
		for list, i in lists
			currentListIndex = i + 1
			userLists[list.id] = []
			getMembers list.id

	t.getLists user, {}, addLists

#watchStream()
getLists "jgallen23", (userLists) ->
	debugger
	console.log "done"
