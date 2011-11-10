var http = require('http');
var https = require('https');
var querystring = require("querystring");

function GoogleReader() {}

GoogleReader.prototype._makeRequest = function(path, data, callback, method, secure) {
  if (method == null) method = "GET";
  if (secure == null) secure = false;
  var qs = data ? querystring.stringify(data) : "";
  var options = {
    host: "www.google.com",
    path: method === "GET" ? "" + path + "?" + qs : path,
    method: method,
    headers: {}
  };
  if (method === "POST") {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  if (this.auth) {
    options.headers['Authorization'] = "GoogleLogin auth=" + this.auth;
  }
  var protocol = secure ? https : http;
  var req = protocol.request(options, function(res) {
    data = '';
    res.on("error", function(err) {
      return console.log(err);
    });
    res.on('data', function(chunk) {
      return data += chunk;
    });
    return res.on("end", function() {
      return callback(res, data);
    });
  });
  if (method === "POST") req.write(qs);
  return req.end();
};

GoogleReader.prototype.login = function(email, password, loginCallback) {
  this.email = email;
  this.password = password;
  this.loginCallback = loginCallback;
  return this._getSid();
};

GoogleReader.prototype._getSid = function() {
  var query;
  var _this = this;
  query = {
    service: 'reader',
    Email: this.email,
    Passwd: this.password,
    source: "GReader"
  };
  return this._makeRequest("/accounts/ClientLogin", query, function(res, data) {
    var dataSplit;
    dataSplit = data.split("\n");
    _this.sid = dataSplit[0].split("=")[1];
    _this.auth = dataSplit[2].split("=")[1];
    return _this._getToken();
  }, "POST", true);
};

GoogleReader.prototype._getToken = function() {
  var _this = this;
  return this._makeRequest("/reader/api/0/token", null, function(res, data) {
    _this.token = data;
    return _this.loginCallback();
  });
};

GoogleReader.prototype.unreadCount = function(callback) {
  var query;
  query = {
    allcomments: 'true',
    output: 'json',
    ck: new Date().getTime(),
    scroll: 'client'
  };
  return this._makeRequest("/reader/api/0/unread-count", query, function(res, data) {
    return callback(data);
  });
};

GoogleReader.prototype.getFeed = function(feedUrl, callback) {
  var query;
  query = {
    r: 'n',
    xt: 'user/-/state/com.google/read',
    ck: new Date().getTime(),
    refresh: 'true',
    client: 'scroll',
    output: 'json'
  };
  return this._makeRequest("/reader/api/0/stream/contents/feed/" + feedUrl, query, function(res, data) {
    return callback(data);
  });
};

module.exports = GoogleReader;

