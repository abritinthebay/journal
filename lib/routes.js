var CONS = require('consolidate');
var CONFIG = require('../config/config');
var Engine = CONS[CONFIG.viewEngine];

module.exports = {
	index: function (dfd) {
		Engine('lib/templates/test.hbs', {thing: 'data'}, function(err, html){
			if (err) {
				dfd.reject(err);
			}
			dfd.resolve(html);
		});
	}
};