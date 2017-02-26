import allFS from "fs";
import path from "path";

import ExtraExtra from "../extraextra/index.mjs";
import { processArchive, processPost, processPostOutput } from "./process.mjs";

const fs = allFS.promises;
const sortKeys = (obj, fn) => Object.keys(obj).sort(fn);

const outputContent = async(filePath, filename, content, opts = {}, extension = "html") => {
	const written = [];
	if (content) {
		const outputLocation = path.resolve(path.join(filePath, `${filename}.${extension}`));
		await fs.mkdir(filePath, { recursive: true });
		await fs.writeFile(outputLocation, processPostOutput(content, opts));
		written.push(outputLocation.replace(process.cwd(), ""));
	}
	return written;
};

const createPostFile = ({ PAGES = {}, POSTS_BY_DATE, year, month, date }, opts) => async postName => {
	const isLink = POSTS_BY_DATE[year][month][date][postName].frontmatter.type === "link";
	const postPath = path.resolve(`${process.cwd()}/build/${isLink ? "link/" : ""}${year}/${month}/${date}/`);
	const content = processPost(PAGES, [POSTS_BY_DATE[year][month][date][postName]], {}, opts);
	return outputContent(postPath, postName, content);
};

const dateSoonestFirst = (first, second) => {
	// Lowest numeric date is first (most recent first) No date? Unix Epoch.
	const alpha = new Date(first.frontmatter && first.frontmatter.date || 0);
	const beta = new Date(second.frontmatter && second.frontmatter.date || 0);
	return alpha > beta ? -1 : alpha < beta ? 1 : 0;
};

const createPageFile = async(PAGES, pageContent, opts) => {
	const pagePath = pageContent.frontmatter.type === "subpage" ?
		path.resolve(`${opts.publish}/${pageContent.frontmatter.parent}`)
		: path.resolve(opts.publish);
	const content = processPost(PAGES, [pageContent], {}, opts);
	return outputContent(pagePath, pageContent.frontmatter.slug, content);
};

const optsToFeed = opts => ({
	feedUrl: opts.feedUrl,
	title: opts.title,
	description: opts.description,
	id: opts.url,
	url: opts.url,
	language: opts.lang,
	copyright: opts.copyright,
	author: opts.author
});

const optsToItemFactory = opts => post => ({
	id: `${Date.parse(post.frontmatter.date)}-${post.frontmatter.slug}`,
	title: post.frontmatter.title,
	link: `${opts.url}${post.frontmatter.permalink}`,
	date: new Date(Date.parse(post.frontmatter.date)),
	summary: post.frontmatter.summary
});

export const createAndOrderPost = (data, opts) => postId => {
	const { POSTS_BY_DATE, year, month, date } = data;
	createPostFile(data, opts)(postId); // Async call but don't really care
	return POSTS_BY_DATE[year][month][date][postId];
};

export const createLatest = (
	PAGES,
	POSTS,
	opts = {},
	frontmatter = { permalink: "/" }
) => outputContent(
	opts.publish,
	"index",
	processPost(PAGES, POSTS, frontmatter, opts)
);

export const createArchive = (
	PAGES,
	POSTS,
	opts = {},
	frontmatter = { title: "Archive", permalink: "/archive/" }
) => outputContent(
	`${opts.publish}/archive`,
	"index",
	processArchive(PAGES, POSTS, frontmatter, opts)
);

export const createPages = (PAGES, opts = {}) => Object.keys(PAGES)
	.map(page => createPageFile(PAGES, PAGES[page], opts));

export const createAndGetSortedPosts = (PAGES, POSTS_BY_DATE, opts) => sortKeys(POSTS_BY_DATE)
	.flatMap(year => sortKeys(POSTS_BY_DATE[year]) // Most recent year
		.flatMap(month => sortKeys(POSTS_BY_DATE[year][month]).reverse() // Most recent month
			.flatMap(date => sortKeys(POSTS_BY_DATE[year][month][date], dateSoonestFirst).reverse() // Most recent date
				.flatMap(createAndOrderPost({ PAGES, POSTS_BY_DATE, year, month, date }, opts)))))
	.reverse();

export const createFeeds = (POSTS, opts = {}) => {
	const hasRequiredOpts = opts.outputPath && opts.url && opts.feedUrl && opts.title && opts.description;
	if (POSTS.length === 0 && !hasRequiredOpts) {
		/* eslint-disable-next-line no-console */
		console.log("Required options for feeds not present, skipping.");
		return;
	}

	const feedPath = opts.outputPath;
	const feed = new ExtraExtra(optsToFeed(opts));
	const itemFactory = optsToItemFactory(opts);

	POSTS.forEach(post => feed.addItem(itemFactory(post)));

	const xmlOpts = {
		caseSensitive: true,
		keepClosingSlash: true,
		collapseBooleanAttributes: false,
		html5: false,
		removeOptionalTags: false,
		useShortDoctype: false
	};

	outputContent(feedPath, "rss", feed.rss2(), xmlOpts, "xml");
	outputContent(feedPath, "atom", feed.atom(), xmlOpts, "xml");
	outputContent(feedPath, "feed", feed.json(), xmlOpts, "json");
};
