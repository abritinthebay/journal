# Journal: A Personal Publishing Platform

> **Journal**. \ˈjər-nəl\ _Noun_. Definition: chronicle, account, narrative, _life_.



> Isn't it mysterious to begin a new journal like this? I can run my fingers through the fresh clean pages but I cannot guess what the writing on them will be.  
> ― Maud Hart Lovelace

## Getting Started

The first step is installing journal, this is trivially easy as it's available as an NPM module:

	npm install journal

### Minimal Example

Journal is designed to be really *really* simple to get running. Your entire server could use just *5 lines of code*!

```JavaScript
	var	Express = require('express');
	var Journal = require('./lib/journal.js');
	var app = Express();

	Journal.init(app);
	app.listen(3000);
```

The [default settings](config/config.js) can be easily overridden but Journal will assume Express and MongoDB are the technologies you'll be using if you don't change them. Express is currently the only supported web server but support can be added for more via *adapters*.

## Databases

Journal is largely database independent as it uses [Caminte](https://github.com/biggora/caminte) behind the scenes for talking for communication.

A complete and up-to-date list of supported databases is available at that project but as of this writing this means Journal supports:
> mongodb, mysql, redis, couchdb, postgres, sqlite3, riak, mongoose, neo4j, firebird, nano

## Adapters

Adapters are code that provides a way for Journal to speak to different routing APIs using the same calls throughout its code. This means that once a Journal application hook is written it *should* be platform independent (if it's not it's a bug!).

Currently Journal ships with only one adapter: Express. The roadmap includes support for more (node's http module for example) but it's extremely easy to write your own adapters - fork this project and submit a merge request for your favorite server adapter!

#License and Copyright
Journal is licensed under the GPL v2 (or later) and is Copyright © 2013 Gregory Wild-Smith 

# Meta
[![Build Status](https://api.travis-ci.org/abritinthebay/journal.png)](https://travis-ci.org/abritinthebay/journal)  
[![NPM Version](https://badge.fury.io/js/journal.png)](http://badge.fury.io/js/journal)
