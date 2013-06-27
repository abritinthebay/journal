/* 
 * Express webserver Adapter for Journal
 */
var J = require('../journal');
var express = require('express');

module.exports = function (server, options) {
	// first, lets setup the static directory
	server.use("/journal", express.static(options.static_location, { maxAge: options.static_cache_length }));

	server.get('/', function (req,res, next) {
		J.router('index').then(function(html) {
			res.send(200, html);
		});
	});
};