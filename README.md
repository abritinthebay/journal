# Journal: A Personal Publishing Platform

> **Journal**. \ˈjər-nəl\ _Noun_. Definition: chronicle, account, narrative, _life_.

Journal is web software you can use to create a beautiful website or blog. It has support for themes, multiple database technolgies and is written in JavaScript to run on NodeJS.

> Isn't it mysterious to begin a new journal like this? I can run my fingers through the fresh clean pages but I cannot guess what the writing on them will be.  
> ― Maud Hart Lovelace

## Getting Started

Assuming you have [NodeJS](http://nodejs.org) installed already then the first step is installing Journal, this is trivially easy as it's available as an NPM module. Simply run the following command in your Node project folder:

```Shell
	npm install journal
```

You might want to include the --save argument to append Journal to your projects package.json file, but it is not required. Installing globally (with the -g flag) is not currently recommended or required.

### Minimal Example

Journal is designed to be really *really* simple to get running. Your entire site could use just *5 lines of code*!

```JavaScript
	var Express = require('express');
	var Journal = require('./lib/journal.js');
	var app = Express();

	Journal.init(app);
	app.listen(80);
```

The [default settings](config/config.js) can be easily overridden but Journal will assume Express and MongoDB are the technologies you'll be using if you don't. Express is currently the only supported web server but support can be added for more via *adapters*.

## Configuring Journal

Configuration is performed by either passing a config object to the init function or by having a journal-config.js file in your project root folder. Journal will look for this file and use it if it exists, overwriting the default options. The default configuration file is as follows:

```JavaScript
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
```
To override this you need to create a file in your node process root of /config/journal-config.js that exports the options you wish to set. Any not set will be assumed to still use the defaults.

## Databases

Journal is largely database independent as it uses [Caminte](https://github.com/biggora/caminte) behind the scenes for talking for communication.

A complete and up-to-date list of supported databases is available at that project but as of this writing this means Journal supports:

> mongodb, mysql, redis, couchdb, postgres, sqlite3, riak, mongoose, neo4j, firebird, nano

Databases are configured via the 'db' property of your configuration file.

## Adapters

Adapters are code that provides a way for Journal to speak to different routing or server module APIs using the same calls throughout its code. This means that once a Journal application hook is written it *should* be platform independent (if it's not it's a bug!)

Currently Journal ships with only one adapter: Express. The roadmap includes support for more (node's http module for example) but it's extremely easy to write your own adapters - fork this project and submit a merge request for your favorite server adapter!

#License and Copyright
Journal is licensed under the GPL v2 (or later) and is Copyright © 2013 Gregory Wild-Smith.

# Meta
[![Build Status](https://api.travis-ci.org/abritinthebay/journal.png)](https://travis-ci.org/abritinthebay/journal)  
[![NPM Version](https://badge.fury.io/js/journal.png)](http://badge.fury.io/js/journal)
