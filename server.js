var	Express = require('express');
var Journal = require('./lib/journal.js');
var app = Express();

/* Now set up the routes */

Journal.init(app);

// app.get('/', function (req,res, next) {
//	console.log(Date.now());
//	console.log(req.route);
//	// console.log(__dirname);
//	// res.send(200, 'OK');
//	CONS.handlebars('lib/templates/test.hbs', {thing: 'data'}, function(err, html){
//		if (err) {
//			//throw err;
//			console.log(err);
//		}
//		console.log(html);
//		res.send(200, html);
//	});
//});

app.listen(3000);