/* 
 * Express webserver Adapter for Journal
 */
var J = require('../journal');
module.exports = function (server) {
	server.get('/', function (req,res, next) {
		var time = Date.now();
		J.router('index').then(function(html) {
			res.send(200, html);
			console.log(Date.now() -time);
		});
	});
};