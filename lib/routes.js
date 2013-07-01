var CONS = require('consolidate');
var CONFIG = require('../config/config');
var _ = require('underscore');

var Routes = (function () {
	var Engine = CONS[CONFIG.viewEngine];
	var template = CONFIG.template ? CONFIG.template : 'default';
	var templatePartials = function (opts) {
		if (!opts) { opts = {}; }
		var defaults =  {
			header: 'header'
		};
		return _.extend(defaults, opts);
	};

	return {
		index: function (dfd) {
			Engine('lib/templates/' + template + '/index.hbs', {
				test: 'data',
				partials: templatePartials()
			}, function(err, html){
				if (err) {
					dfd.reject(err);
				}
				dfd.resolve(html);
			});
		},
		admin: function() {}
	};
})();

module.exports = Routes;