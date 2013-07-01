/* 
 * Express webserver Adapter for Journal
 */
var Journal = require('../../journal');
var express = require('express');

module.exports = function (server, options) {
	// first, lets setup the static directory
	server.use("/journal", express.static(options.static_location, { maxAge: options.static_cache_length }));


	// Can probably do all this with a fall through function rather than set routes individually for each url.
	// Will have to investigate - might not be most efficiant as the '/:paramA/:paramB/' parsing model.
	server.get('/', function (req,res, next) {
		Journal.router('index').then(function(html) {
			res.send(200, html);
		});
	});
};