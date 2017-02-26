import { PROBABLY_HTML } from "./utils.mjs";

const getAuthor = author => author && author.name && {
	name: author.name,
	url: author.url,
	avatar: author.avatar
};

const getContentKey = content => PROBABLY_HTML.test(content) ? "content_html" : "content_text";

const getAttachment = enclosure => enclosure && enclosure.url && {
	"url": enclosure.url,
	"size_in_bytes": enclosure.length,
	"mime_type": enclosure.mime,
	"title": enclosure.title,
	"duration_in_seconds": enclosure.duration
};
/* eslint-disable dot-notation */
const feedItem = (list, item) => {
	if (item.link && item.content) {
		const output = {};
		output[getContentKey(item.content)] = item.content;
		output.id = item.link;
		output.url = item.link;
		output["external_url"] = item.externalLink;
		output.title = item.title;
		output.summary = item.summary;
		output.image = item.image.url && item.image.url;
		output["date_published"] = item.date instanceof Date && item.date.toISOString();
		output.author = getAuthor(item.author);
		output.tags = item.categories;
		output.attachments = [getAttachment(item.enclosure)];
		list.push(output);
	}
	return list;
};
/* eslint-enable dot-notation */

const jsonFeed = channel => {
	let output = {};
	if (channel.title && channel.items && channel.items.length && channel.feedUrl && channel.link) {
		output = {
			"version": "https://jsonfeed.org/version/1",
			"title": channel.title,
			"home_page_url": channel.link,
			"feed_url": `${channel.feedUrl}/feed.json`,
			"items": channel.items.map(feedItem)
		};
		output.description = channel.description;
		output.icon = channel.image && channel.image.url;
		output.favicon = channel.icon;
		output.author = getAuthor(channel.author);
	}
	return JSON.stringify(output);
};

export default jsonFeed;
