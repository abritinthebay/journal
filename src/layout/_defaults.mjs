export default {
	"titleTemplate": "%title%",
	"type": "article",
	"link": [
		{ "rel": "manifest", "href": "/json/manifest.json" },
		{ "rel": "alternate", "href": "/feeds/atom", "title": "Atom feed", "type": "application/atom+xml" },
		{ "rel": "alternate", "href": "/feeds/rss", "title": "RSS feed", "type": "application/rss+xml" },
		{ "rel": "alternate", "href": "/feeds/json", "title": "JSON feed", "type": "application/json" },
		{ "rel": "preload", "href": "/css/initial.css", "as": "style" },
		{ "rel": "preload", "href": "/css/main.css", "as": "style" },
		{ "rel": "stylesheet", "href": "/css/initial.css" }
	],
	"bodyLink": [{ "rel": "stylesheet", "href": "/css/main.css" }],
	"meta": [],
	"html": {
		"lang": "en"
	}
};
