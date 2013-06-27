var Q = require('q');
var CONFIG = require('../config/config');
var Routes = require('./routes');
var Errors = require('./errors');

var J = {};

J.options = {
	static_location: __dirname + '/static',
	static_cache_length: 2419200000
};

J.init = function (server) {
	if (!server) {
		throw new Error('Journal::Init failed - no WebServer object was passed.');
	}
	var adapter = require('./adapters/' + CONFIG.webServer);
	adapter(server, J.options);
};

J.router = function (route, data) {
	var deferred = Q.defer();
	if (Routes[route]) {
		process.nextTick(function () {
			Routes[route](deferred);
		});
		return deferred.promise;
	} else {
		return deferred.reject(new Errors.RoutingError('Route "'+route + '" Not Found'));
	}

};

exports.version = '0.0.1';
exports.init = J.init;
exports.router = J.router;