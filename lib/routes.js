var CONS = require('consolidate');
var CONFIG = require('../config/config');
var _ = require('underscore');

var Routes = (function () {
	var Engine = CONS[CONFIG.viewEngine];
	var template = CONFIG.template ? CONFIG.template : 'default';
	var templatePartials = function (opts) {
		if (!opts) { opts = {}; }
		var defaults =  {
			header: 'header',
			footer: 'footer'
		};
		return _.extend(defaults, opts);
	};

	return {
		index: function (dfd) {
			console.log('in index route');
			Engine('lib/templates/' + template + '/index.' + CONFIG.templateExt, {
				test: 'data',
				title: 'test title',
				partials: templatePartials()
			}, function(err, html){
				if (err) {
					dfd.reject(err);
					return;
				}
				dfd.resolve(html);
			});
		},
		admin: function() {}
	};
})();

module.exports = Routes;