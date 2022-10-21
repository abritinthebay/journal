# Journal: A Personal Publishing Platform

> **Journal**. \ˈjər-nəl\ _Noun_. Definition: chronicle, account, narrative, _life_.

Journal is a markdown-focused blogging platform. It keeps all the markdown for all you posts and generates static files to serve them as html.

It's small, simple, and fast!

> Isn't it mysterious to begin a new journal like this? I can run my fingers through the fresh clean pages but I cannot guess what the writing on them will be.
> ― Maud Hart Lovelace

## Instalation

Assuming you have [NodeJS](http://nodejs.org) installed already then you can just run journal directly through `npx`.

```Shell
	npx journal
```

You can also install the binary globally like so:

```Shell
	npm i -g journal
```
## Usage

`journal [command] [args]`

### Commands
`journal build` - builds a journal
`journal serve` - starts a httpserver locally to serve any content [aliases: view]

### Config Arguments (which can be overriden):
`-c, --config [default: <current dir>/journal.json]

### Directory Arguments: (overrides config)
`-i, --input, --content` Location of markdown to be parsed [default: <current dir>/content/]
`-o, --output` Location to output generated html [default: <current dir>/build/]
`-s, --static` Location of static files (css, images, etc) [default: <current dir>/static/]

### Other Arguments
`-v, --version` Show version number [boolean]
`-h, --help` Show help [boolean]

## Examples:
```
$ journal                               Basic usage, uses defaults
$ journal --config myconfig.json        Use a custom config file
$ journal -i '../custom/dir'            Use a custom content directory
$ journal view                          Start a server for built content
$ journal view --config myconfig.json   Start server with a custom config
```
# License
Journal is licensed under the Apache License 2.0, which is available in the LICENCE.md file.

# Meta
[![Build Status](https://api.travis-ci.org/abritinthebay/journal.png)](https://travis-ci.org/abritinthebay/journal)
[![NPM Version](https://badge.fury.io/js/journal.png)](http://badge.fury.io/js/journal)
