var str = require('str.js');
module.exports = {
  homepage: function() {
    return "/";
  },
  rssFeed: function(user) {
    var id = (typeof user === "string")?user:user._id.toString();
    return str.format("/feed/{0}.rss", [id]);
  },
  htmlFeed: function(user) {
    var id = (typeof user === "string")?user:user._id.toString();
    return str.format("/feed/{0}.html", [id]);
  },
  login: function() {
    return "/auth/twitter/";
  },
  profile: function(user) {
    if (user)
      return "/profile/"+user._id.toString();
    return "/profile/";
  }
};
