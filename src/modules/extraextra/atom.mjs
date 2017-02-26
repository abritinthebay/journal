import { MINIFY_IGNORE, PROBABLY_HTML } from "./utils.mjs";

const parsePerson = person => `
        ${person.name ? `<name>${person.name}</name>` : ""}
        ${person.email ? `<email>${person.email}</email>` : ""}
        ${person.url ? `<uri>${person.url}</uri>` : ""}`;

const channelItem = ({ title, link, summary, author, categories, date, content, enclosure }) => {
	if (title || summary) {
		return `
        <entry>
            ${title ? `<title>${title}</title>` : ""}
            ${link ? `${MINIFY_IGNORE}<link href="${link}"/>${MINIFY_IGNORE}` : ""}
            ${link ? `<id>${link}</id>` : ""}
            ${date instanceof Date ? `<updated>${date.toISOString()}</updated>` : ""}
            ${summary ? `<summary>${summary}</summary>` : ""}
            ${author ? `<author>${parsePerson(author)}</author>` : ""}
            ${categories ? categories.map(cat => `<category>${cat}</category>`).join("") : ""}
            ${content ? `<content type="${PROBABLY_HTML.test(content)}">${content}</content>` : ""}
            ${enclosure && enclosure.url ? `${MINIFY_IGNORE}<link rel="enclosure" href="${enclosure.url}" length="${enclosure.length || "0"}" ${enclosure.mime ? `type="${enclosure.mime}"` : ""} />${MINIFY_IGNORE}` : ""}
        </entry>`;
	}
	return "";
};

const required = ({ title, items, id, feedUrl }) => title && items.length && feedUrl && id;

export const atomXML = (channel = {}) => {
	if (required(channel)) {
		return `<?xml version="1.0" encoding="utf-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
            ${channel.author ? `<author>${parsePerson(channel.author)}</author>` : ""}
            <generator>Extra! Extra!</generator>
            ${channel.icon ? `<icon>${channel.icon}</icon>` : ""}
            <id>${channel.id || channel.url}</id>
            ${MINIFY_IGNORE}<link href="${channel.feedUrl}/atom.xml" rel="self" type="application/atom+xml" />${MINIFY_IGNORE}
            ${channel.image && channel.image.url ? `<logo>${channel.image.url}</logo>` : ""}
            ${channel.copyright ? `<rights>${channel.copyright}</rights>` : ""}
            ${channel.subtitle ? `<subtitle>${channel.subtitle}</subtitle>` : ""}
            <title>${channel.title}</title>
            <updated>${channel.items[0].date instanceof Date ? channel.items[0].date.toISOString() : new Date().toISOString()}</updated>
            ${(channel.items || []).map(channelItem).join("")}
        </feed>`;
	}
	return "";
};

export default atomXML;
