var _ = require('underscore');
var fs = require('fs');

var config = {};
var defaults = {
	adapter: "express",
	templates: {
		name: 'default',
		folder: "lib/templates/",
		engine: "handlebars",
		extension: "hbs"
	},
	db: {
		engine: "mongodb"
	}
};

/*
 * If we have a config file then lets load it. Using require caches the response.
 * May be a better way of checking for file existence each time they are loaded, suggestions welcome.
 */
if (fs.existsSync(process.cwd() + '/config/journal-config.js')) {
	config = require(process.cwd() + '/config/journal-config');
}

module.exports = _.defaults(config, defaults);