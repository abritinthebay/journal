var Journal = (function () {
	var Q = require('q');
	var CONFIG = require('../config/config');
	var Routes = require('./routes');
	var Errors = require('./errors');

	var options = {
		static_location: __dirname + '/static',
		static_cache_length: 86400000, // one day 
		db: CONFIG.db
	};

	return {
		// Version allows simple version inspection, yes NPM will take care of this but it can be useful.
		version: '0.0.1',

		init :function (server) {
			if (!server) {
				throw new Error('Journal::Init failed - no WebServer object was passed.');
			}
			var adapter = require('./adapters/webserver/' + CONFIG.adapter);
			adapter(server, options);
		},
		//
		router : function (route, data) {
			var deferred = Q.defer();
			if (Routes[route]) {
				process.nextTick(function () {
					Routes[route](deferred).fail();
				});
				return deferred.promise;
			} else {
				return deferred.reject(new Errors.RoutingError('Route "'+route + '" Not Found'));
			}
		}
	};
})();

module.exports = Journal;