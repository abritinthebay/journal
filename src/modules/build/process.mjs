import htmlMinifier from "html-minifier";

import article from "../../components/article.mjs";
import dateLine from "../../components/dateline.mjs";
import htmlWrapper from "../../components/htmlWrapper.mjs";
import title from "../../components/title.mjs";

const { minify } = htmlMinifier;

const compose = (...fns) => (...args) => fns.reduceRight((val, fn) => fn(val), args);
const pad = num => num < 10 ? `0${num}` : `${num}`;
const getYMD = date => ({
	year: date.getFullYear(),
	month: pad(date.getMonth() + 1),
	date: date.getDate()
});

const processContent = (content, frontmatter, isList = false) => {
	const dateTime = new Date(frontmatter.date);
	const prefix = frontmatter.type === "page" || frontmatter.type === "subpage" ? "page" : dateTime.getTime();
	const uniq = `${prefix}-${frontmatter.slug}`;

	return {
		content: article({
			content,
			date: dateTime,
			frontmatter,
			isList,
			key: uniq,
			uniqueId: uniq
		}),
		frontmatter
	};
};

// If any are different then, as they are sorted, must be earlier date
const isOlderDate = (previous, current) => current.date < previous.date
		|| current.month < previous.month
		|| current.year < previous.year;

const basePages = [];

const getPageList = PAGES => [...basePages, ...Object.entries(PAGES).map(([_key, value]) => value.frontmatter)];

const isArrayWithContent = obj => Array.isArray(obj) && obj.length > 0;

const getContent = ([PAGES, POSTS, front = {}, config = {}]) => {
	if (isArrayWithContent(POSTS)) {
		const frontmatter = POSTS.length === 1 ? POSTS[0].frontmatter : front;
		const latest = getYMD(new Date(POSTS[0].frontmatter.date));
		const pages = getPageList(PAGES);
		const content = POSTS.flatMap(post => {
			const date = new Date(post.frontmatter.date);
			const current = getYMD(date);
			if (isOlderDate(latest, current) && post.frontmatter.type !== "article") {
				return [dateLine({ date, key: date.getTime() }), processContent(post.content, post.frontmatter, true).content];
			}
			return processContent(post.content, post.frontmatter, true).content;
		}).join("");

		return {
			content,
			frontmatter,
			pages,
			config
		};
	}
	return null;
};

const getArchiveContent = ([PAGES, POSTS, frontmatter = {}, config]) => {
	if (isArrayWithContent(POSTS)) {
		let latest = { year: Number.MAX_SAFE_INTEGER, month: Number.MAX_SAFE_INTEGER, day: Number.MAX_SAFE_INTEGER };
		const longDateFormat = { month: "long", year: "numeric" };
		const shortDateFormat = { year: "numeric", month: "short", day: "numeric" };
		const pages = getPageList(PAGES);
		const content = `<dl id="archive">
		${POSTS.flatMap(post => {
			if (post.frontmatter.type === "link" && config.excludeArchiveLinks) {
				return "";
			}
			const date = new Date(post.frontmatter.date);
			const current = getYMD(date);
			const subtitle = dateLine({ date, shortDateFormat, key: date.getTime() });
			const titleContent = title({
				date,
				frontmatter: post.frontmatter,
				isList: true,
				key: date.getTime(),
				showDate: false,
				subtitle,
				tag: "dd",
				type: "article"
			});

			if (latest.year > current.year || latest.year === current.year && Number(latest.month) > Number(current.month)) {
				latest = current;
				return [`<dt key="${date.getTime()}">${dateLine({ accuracy: "month", date, longDateFormat })}</dt>`, titleContent];
			}

			return titleContent;
		}).join("")}
		</dl>`;

		return {
			content,
			frontmatter,
			pages,
			config
		};
	}
	return null;
};

const addStaticPages = pages => {
	const LOW_PRIORITY = 99;
	const HIGH_PRIORITY = 0;
	pages.push({
		type: "page",
		slug: "archive",
		title: "Archive",
		priority: HIGH_PRIORITY,
		permalink: "/archive/"
	},
	{
		type: "page",
		slug: "rss",
		title: "RSS Feed",
		priority: LOW_PRIORITY,
		permalink: "/feed/rss.xml"
	});
	return pages;
};

const sortByPriority = (obj1, obj2) => obj1.priority === obj2.priority ? 0 : obj1.priority < obj2.priority ? -1 : 1;

const renderPostContent = post => {
	if (!post) {
		return false;
	}

	const { frontmatter, content: html, config = {} } = post;
	const { pages } = post;

	addStaticPages(pages);
	pages.sort(sortByPriority);

	return htmlWrapper({ html, pages, config, frontmatter });
};

export const processPost = compose(
	renderPostContent,
	getContent
);

export const processArchive = compose(
	renderPostContent,
	getArchiveContent
);
// Old version
export const processPostOutput = (content, opts = {}) => content ? minify(content, {
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	decodeEntities: false,
	html5: true,
	removeComments: true,
	removeScriptTypeAttributes: true,
	removeOptionalTags: false,
	sortAttributes: true,
	sortClassName: true,
	useShortDoctype: true,
	...opts
}) : "";

