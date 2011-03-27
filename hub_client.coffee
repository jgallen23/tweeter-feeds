http = require 'http'
Url = require 'url'
Client = require "./nubnub/src/client"

debugging = true

port = 3000
subscribers = {}

client = http.createServer (req, resp) ->
  body = ''
  req.on 'data', (chunk) -> body += chunk

  req.on 'end', ->
    if req.method == 'GET'
      console.log "CLIENT: Receiving verification challenge..." if debugging
      resp.writeHead 200
      resp.write Url.parse(req.url, true).query['hub.challenge']
    else
      console.log "CLIENT: Receiving published data..." if debugging
      resp.writeHead 200
      resp.write 'booya'
    resp.end()

client.listen port+1

client_instance = Client.build(
    hub: "http://localhost:#{port}/hub"
    topic: "http://server.com/topic"
    callback: "http://localhost:#{port+1}/callback"
  )

console.log "CLIENT: Sending subscription request..." if debugging
client_instance.subscribe (err, resp, body) ->
  if err
    console.log "CLIENT: Error with subscription:"
    console.log err
    server.close()
    client.close()
  else
    console.log body
    console.log "CLIENT: Subscription successful!" if debugging

process.on 'exit', ->
  console.log 'done'
