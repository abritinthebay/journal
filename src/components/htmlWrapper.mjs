import defaults from "../layout/_defaults.mjs";

const toHTMLAttrs = attrs => Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(" ");

/*
 * Og:type values:
 *
 * article - Namespace URI: http://ogp.me/ns/article#
 * article:published_time - datetime - When the article was first published.
 * article:modified_time - datetime - When the article was last changed.
 * article:expiration_time - datetime - When the article is out of date after.
 * article:author - profile array - Writers of the article.
 * article:section - string - A high-level section name. E.g. Technology
 * article:tag - string array - Tag words associated with this article.
 *
 * profile - Namespace URI: http://ogp.me/ns/profile#
 * profile:first_name - string - A name normally given to an individual by a parent or self-chosen.
 * profile:last_name - string - A name inherited from a family or marriage and by which the individual is commonly known.
 * profile:username - string - A short unique string to identify them.
 * profile:gender - enum(male, female) - Their gender.
 *
 * website - Namespace URI: http://ogp.me/ns/website#
 */
const openGraph = data => [
	data.title && { property: "og:title", content: data.title },
	data.type && { property: "og:type", content: data.type },
	data.image && { property: "og:image", content: data.image },
	data.url && { property: "og:url", content: data.url },
	data.description && { property: "og:description", content: data.description },
	data.name && { property: "og:site_name", content: data.name },
	data.video && { property: "og:video", content: data.video },
	data.imageAlt && { property: "og:image:alt ", content: data.imageAlt },
	...data.type === "article" ? [
		data.date && { name: "article:published_time", content: data.date },
		data.author && { name: "article:author", content: data.author },
		data.category && { name: "article:section", content: data.category },
		...data.tags && Array.isArray(data.tags) ?
			data.tags.reduce((meta, tag) => meta.push({ name: "article:tag", content: tag }), [])
			: []
	]
		: []
]
	.filter(meta => !!meta);

const twitterCard = data => [
	data.image && { name: "twitter:card", content: data.image ? "summary_large_image" : "summary" },
	data.title && { name: "twitter:title", content: data.title },
	data.twitterSite && { name: "twitter:site", content: data.twitterSite },
	data.twitterCreator && { name: "twitter:creator", content: data.twitterCreator },
	data.image && { name: "twitter:image", content: data.image },
	data.imageAlt && { name: "twitter:image:alt", content: data.imageAlt }
]
	.filter(meta => !!meta);

const basicMeta = data => [
	{ "charset": "utf-8" },
	{ "http-equiv": "Content-Type", "content": "text/html" },
	{ "http-equiv": "Accept-CH", "content": "DPR,Width,Viewport-Width" },
	{ name: "robots", content: data.robots || "index, follow" },
	data.viewport && { name: "viewport", content: data.viewport },
	data.description && { name: "description", content: data.description },
	data.themeColor && { name: "theme-color", content: data.themeColor },
	data.colorScheme && { name: "color-scheme", content: data.colorScheme },
	data.author && { name: "author", content: data.author },
	data.tags && Array.isArray(data.tags) && { name: "keywords", content: data.tags.join("") }
]
	.filter(meta => !!meta);

const getMeta = data => [...basicMeta(data), ...twitterCard(data), ...openGraph(data)];

const mergeWithDefaults = (input = {}) => ({
	...defaults,
	...input,
	meta: [...defaults.meta, ...input.meta || [], ...getMeta({ ...defaults, ...input })],
	link: [...defaults.link, ...input.link || []]
});


const MAX_TITLE_LENGTH = 70; // Title should be 70 characters or less for SEO reasons.
const limitTitle = (input, MAX_LENGTH = MAX_TITLE_LENGTH) => {
	let title = input;
	if (title.length > MAX_LENGTH) {
		const titleArr = title.split(" ");
		title = titleArr.reduce((acc, current) => {
			const newAcc = `${acc} ${current}`;
			return newAcc.length > MAX_LENGTH - 1 ? `${acc}…` : newAcc;
		});
	}
	return title;
};

const processTitle = (template, text) => template.replace("%title%", text);

const headerData = json => ({
	defaultTitle: json.title,
	titleTemplate: json.titleTemplate,
	html: json.html,
	title: `<title>${json.titleTemplate ? processTitle(json.title, limitTitle(json.title, MAX_TITLE_LENGTH - json.titleTemplate.length - 2)) : limitTitle(json.title)}</title>`,
	base: json.base,
	meta: json.meta.map(data => `<meta ${toHTMLAttrs({ ...data })} >`),
	link: json.link.map(data => `<link ${toHTMLAttrs({ ...data })} >`),
	bodyLink: json.bodyLink.map(data => `<link ${toHTMLAttrs({ ...data })} >`)
});

const getHead = input => headerData(mergeWithDefaults(input));

const head = props => `<head>
${props.title}
${props.base}
${props.style}
${props.meta}
${props.script}
${props.link}
</head>`;

const logo = config => config.logo ? config.logo : config.logoUrl ? `<img src="${config.logoUrl}" alt="site logo">` : "";
const title = config => config.title ? `<h1 id="sitetitle"><a href="${config.root || "/"}">${config.title}</a></h1>` : "";

const siteheader = ({ config, pages }) => `<header id="siteheader">
	<div id="logo">${logo(config)}</div>
	${title(config)}
${config.author && config.author.name && config.showAuthor ? `<dl id="byline"><dt>By </dt><dd>${config.author.name}</dd></dl>` : ""}
${pages && pages.length > 0 ?
`<ul>
${pages.reduce((output, page) => `${output}${page.type !== "subpage" ? `<li><a href="${page.permalink}">${page.title}</a></li>` : ""}`, "")}
</ul>` : ""}
</header>`;

const bodyClass = (classGenerator, frontmatter) => `class="${frontmatter && frontmatter.type || "index"} ${classGenerator && typeof classGenerator === "function" && classGenerator(frontmatter)}"`;

/*
 * Mapping from Frontmatter to Meta Data fields.
 *
 *	data.url && { property: "og:url", content: data.url },
 *	data.category && { name: "og:article:section", content: data.category },
 */

const frontMatterToMeta = (frontmatter, site) => ({
	name: site.title,
	author: frontmatter.author || site.author && site.author.name,
	description: frontmatter.summary || site.description,
	viewport: "width=device-width, initial-scale=1, user-scalable=yes",
	title: frontmatter.title || site.title,
	tags: frontmatter.tags,
	themeColor: site.themeColor,
	colorScheme: site.colorScheme,
	image: frontmatter.image || `${site.url}${site.logoUrl}`,
	imageAlt: frontmatter.imageAlt,
	twitterSite: site.twitter,
	twitterCreator: frontmatter.twitter || site.author && site.author.twitter,
	type: frontmatter.type === "article" || frontmatter.type === "link" ? "article" : "website",
	date: frontmatter.date && new Date(frontmatter.date).toISOString(),
	video: frontmatter.video,
	url: `${site.url}${frontmatter.permalink}`,
	titleTemplate: site.titleTemplate
});

const metaWrapper = meta => {
	const data = getHead(meta);
	return {
		htmlAttributes: data.html || "",
		title: data.title && data.title.replace(" & ", " &amp; ") || "",
		base: data.base ?? "",
		style: data.style && data.style.join("") || "",
		meta: data.meta && data.meta.join("") || "",
		script: data.script && data.script.join("") || "",
		link: data.link && data.link.join("") || "",
		bodyLink: data.bodyLink && data.bodyLink.join("") || ""
	};
};

const template = props => {
	const { frontmatter, config, html } = props;
	const context = metaWrapper(frontMatterToMeta(frontmatter, config));
	return `<!DOCTYPE html>
<html ${toHTMLAttrs(context.htmlAttributes)}>
	${head(context)}
	<body ${bodyClass(config.classes, frontmatter)}>
		${siteheader(props)}
		<main>
			${html}
		</main>
		<footer id="sitefooter">
			<p>${config.copyright}</p>
		</footer>
		${context.bodyLink}
	</body>
</html>`;
};

export default template;
