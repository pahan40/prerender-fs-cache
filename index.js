var cacheManager = require('cache-manager');
var fsStore = require('cache-manager-fs');

module.exports = {
	init: function() {
		this.cache = cacheManager.caching({store: fsStore, options: {ttl: process.env.CACHE_TTL || 60 /* seconds */, maxsize: 1000*1000*1000 /* max size in bytes on disk */, path:process.env.CACHE_PATH || '~/diskcache', preventfill:true}});
	},

	requestReceived: function(req, res, next) {
		this.cache.get(req.prerender.url, function (err, result) {
			if (!err && result) {
				req.prerender.cacheHit = true;
				res.send(200, result);
			} else {
				next();
			}
		});
	},

	beforeSend: function(req, res, next) {
		if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
			this.cache.set(req.prerender.url, req.prerender.content);
		}
		next();
	}
};