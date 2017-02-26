import { MINIFY_IGNORE, MINUTES_IN_A_DAY } from "./utils.mjs";

const required = ({ title, feedUrl, description }) => {
	if (title && feedUrl && description) {
		return `<title>${title}</title>
            ${MINIFY_IGNORE}<link>${feedUrl}rss.xml</link>${MINIFY_IGNORE}
            <description>${description}</description>`;
	}
	return false;
};

const parsePerson = person => person.email ? `${person.email}${person.name ? `(${person.name})` : ""}` : "";

const channelImage = ({ url, title, link, description, width, height } = {}) => {
	if (url && title && link) {
		return `<image>
            <url>${url}</url>
            <title>${title}</title>
            ${MINIFY_IGNORE}<link>${link}</link>${MINIFY_IGNORE}
            ${description ? `<description>${description}</description>` : ""}
            ${width ? `<width>${width}</width>` : ""}
            ${height ? `<height>${height}</height>` : ""}
        </image>`;
	}
	return "";
};


const getGUID = id => id ? `<guid isPermaLink="${id.search(/(?<protocol>\w{2,}:\/\/\w+)/) > -1}">${id}</guid>` : "";

const channelItem = ({ title, link, summary, author, categories, comments, enclosure, id, date }) => {
	if (title || summary) {
		return `<item>
            ${title ? `<title>${title.replace(" & ", "&amp;")}</title>` : ""}
            ${link ? `${MINIFY_IGNORE}<link>${link}</link>${MINIFY_IGNORE}` : ""}
            ${summary ? `<description>${summary}></description>` : ""}
            ${author ? `<author>${parsePerson(author)}</author>` : ""}
            ${categories ? categories.map(cat => `<category>${cat}</category>`).join("") : ""}
            ${comments ? `<comments>${comments}</comments>` : ""}
            ${enclosure && enclosure.url ? `<enclosure url="${enclosure.url}" length="${enclosure.length || "0"}" />` : ""}
            ${getGUID(id || link)}
            ${date instanceof Date ? `<pubDate>${date.toUTCString()}</pubDate>` : ""}
        </item>`;
	}
	return "";
};

export const rssXML = (channel = {}) => {
	const mandatory = required(channel);
	if (mandatory) {
		return `<?xml version="1.0"?>
        <rss version="2.0" ${channel.url ? "xmlns:atom=\"http://www.w3.org/2005/Atom\"" : ""}>
            <channel>
                ${mandatory}
                ${channel.feedUrl ? `<atom:link href="${channel.feedUrl}rss.xml" rel="self" type="application/rss+xml" />` : ""}
                ${channel.lang ? `<language>${channel.lang}</language>` : ""}
                ${channel.copyright ? `<copyright>${channel.copyright.replace("&copy;", "")}></copyright>` : ""}
                ${channel.author && channel.author.email ? `<managingEditor>${parsePerson(channel.author)}</managingEditor>` : ""}
                ${channel.webmaster && channel.editor.email ? `<webmaster>${parsePerson(channel.webmaster)}</webmaster>` : ""}
                ${channel.items.length && channel.items[0].date instanceof Date ? `<lastBuildDate>${channel.items[0].date.toUTCString()}</lastBuildDate>` : ""}
                ${channel.categories ? channel.categories.map(cat => `<category>${cat}</category>`).join("") : ""}
                <generator>Extra! Extra!</generator>
                <docs>https://validator.w3.org/feed/docs/rss2.html</docs>
                <ttl>${channel.ttl || MINUTES_IN_A_DAY}</ttl>
                ${channelImage(channel.image)}
                ${(channel.items || []).map(channelItem).join("")}
            </channel>
        </rss>`;
	}
	return "";
};

export default rssXML;
