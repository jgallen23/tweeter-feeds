http = require 'http'
https = require 'https'
querystring = require "querystring"

class GoogleReader
  constructor: ->

  _makeRequest: (path, data, callback, method = "GET", secure = false) ->
    qs = if data then querystring.stringify data else ""

    options =
      host: "www.google.com"
      path: if method == "GET" then "#{ path }?#{ qs }" else path
      method: method
      headers: {
      }
    if method == "POST"
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if @auth
      options.headers['Authorization'] = "GoogleLogin auth=#{@auth}"


    protocol = if secure then https else http

    req = protocol.request options, (res) ->
      #console.log "HEADERS: " + JSON.stringify res.headers
      data = ''
      res.on "error", (err) ->
        console.log err
      res.on 'data', (chunk) ->
        data += chunk
      res.on "end", ->
        callback res, data
    
    if method == "POST"
      req.write qs

    req.end()



  login: (@email, @password, @loginCallback) ->
    @_getSid()

  _getSid: ->
    query =
      service: 'reader'
      Email: @email
      Passwd: @password
      source: "GReader"
    @_makeRequest "/accounts/ClientLogin", query, (res, data) =>
      dataSplit = data.split "\n"
      @sid = dataSplit[0].split("=")[1]
      @auth = dataSplit[2].split("=")[1]
      @_getToken()
    , "POST", true

  _getToken: ->
    @_makeRequest "/reader/api/0/token", null, (res, data) =>
      @token = data
      @loginCallback()

  unreadCount: (callback) ->
    query =
      allcomments: 'true'
      output: 'json'
      ck: new Date().getTime()
      scroll: 'client'

    @_makeRequest "/reader/api/0/unread-count", query, (res, data) ->
      callback data

  getFeed: (feedUrl, callback) ->
    query =
      r: 'n' #sort
      xt: 'user/-/state/com.google/read'
      ck: new Date().getTime()
      refresh: 'true'
      client: 'scroll'
      output: 'json'


    @_makeRequest "/reader/api/0/stream/contents/feed/#{feedUrl}", query, (res, data) ->
      callback data

module.exports = GoogleReader
