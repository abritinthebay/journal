# Journal: A Blog Tool & Publishing Platform for NodeJS

> **Journal**. \ˈjər-nəl\ _Noun_. Definition: chronicle, account, narrative, _life_.



> Isn't it mysterious to begin a new journal like this? I can run my fingers through the fresh clean pages but I cannot guess what the writing on them will be.  
> ― Maud Hart Lovelace

## Meta
[![Build Status](https://api.travis-ci.org/abritinthebay/journal.png)](https://travis-ci.org/abritinthebay/journal)  
[![NPM Version](https://badge.fury.io/js/journal.png)](http://badge.fury.io/js/journal)

## Getting Started

The first step is installing journal, this is trivially easy as it's available as an NPM module:
>	npm install journal

## Minimal Example

Journal is designed to be really *really* simple to get running. Your entire server could use just *5 lines of code*!

```JavaScript
	var	Express = require('express');
	var Journal = require('./lib/journal.js');
	var app = Express();

	Journal.init(app);
	app.listen(3000);
```

Here we are using Express as the webserver. Express is currently the only supported node webserver but support is planned for more (and has been designed into the app). The [default settings](config/config.js)

It's also very easy to write your own adapters for other servers or databases - fork this project and submit a merge request for your server adapter.