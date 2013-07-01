var	Express = require('express');
var Journal = require('./lib/journal.js');
var app = Express();

Journal.init(app);
app.listen(3000);