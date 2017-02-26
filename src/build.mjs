
import allFS from "fs";
import path from "path";

import { createAndGetSortedPosts, createArchive, createFeeds, createLatest, createPages } from "./modules/build/create.mjs";
import copyStatic from "./modules/build/static.mjs";
import convertToMarkdown from "./modules/markdown.mjs";

const POST_LIMIT = 40;
const MINUTES = 60;
const SECONDS = 60;
const MILLISECONDS = 1000;

const convert = convertToMarkdown();
const fs = allFS.promises;

const getFileData = async loc => fs.readFile(path.resolve(loc), "utf-8");
const getFileInfo = async loc => fs.stat(path.resolve(loc));
const pad = num => num < 10 ? `0${num}` : `${num}`;

const datePost = async(POSTS, created, post) => {
	const { frontmatter } = post;
	const year = created.getFullYear();
	const month = pad(created.getMonth() + 1);
	const date = created.getDate();
	POSTS[year] = POSTS[year] || {};
	POSTS[year][month] = POSTS[year][month] || {};
	POSTS[year][month][date] = POSTS[year][month][date] || {};
	POSTS[year][month][date][frontmatter.slug] = post;
};

const getNewPath = (filePath, frontmatter) => {
	const dir = path.dirname(filePath);
	const date = path.dirname(frontmatter.permalink)
		.replace(/(^\/link)+/, "") // Removes the "/link/" from the start of a permalink if it's a link type
		.replace(/\//g, "-")
		.substring(1);
	return `${dir}/${date}-${frontmatter.slug}.md`;
};

const getCreatedDate = (fileInfo, frontmatter, offset) => {
	const created = new Date(frontmatter.date || fileInfo.birthtime);
	// Adjust for timezone (if any)
	created.setTime(created.getTime() + offset);
	return created;
};

const saveFile = ({ POSTS, PAGES, fileInfo, filePath, section, frontmatter, offset, content }) => {
	// Fallback to file birthtime (not ideal, but its all we have) if there is no date.
	const created = getCreatedDate(fileInfo, frontmatter, offset);
	// Only create it if it's a post in the past (time travel isn't allowed!)
	if (created.getTime() < Date.now()) {
		const post = { content, filePath, frontmatter };
		if (section === "posts") {
			datePost(POSTS, created, post);
			fs.rename(filePath, getNewPath(filePath, frontmatter));
		} else {
			PAGES[frontmatter.slug] = post;
		}
	}
};

const processFile = (POSTS, PAGES, opts) => async filePath => {
	const offset = opts.tz ? parseFloat(opts.tz) * MINUTES * SECONDS * MILLISECONDS : 0;
	const section = filePath.includes("/posts/") ?
		"posts"
		: filePath.includes("/pages/") ?
			"pages"
			: null;

	if (section && filePath.endsWith(".md")) {
		const fileInfo = await getFileInfo(filePath);
		const fileData = await getFileData(filePath);
		const { frontmatter, content } = await convert(fileData);
		if (frontmatter.type !== "draft") {
			saveFile({ POSTS, PAGES, fileInfo, filePath, section, frontmatter, offset, content });
		}
	}
};

const DEFAULT_OPTIONS = {
	contentPaths: [],
	site: {},
	feed: {}
};

const getFileNamesFromPath = async filePath => (await fs.readdir(filePath)).map(name => filePath + name);
const processFilesFromPath = (POSTS, PAGES, opts) => async filePath => {
	const files = await getFileNamesFromPath(filePath);
	return Promise.all(files.map(processFile(POSTS, PAGES, opts)));
};

let getAllPosts = () => ({});

const build = async(userOpts = {}) => {
	const opts = {
		...DEFAULT_OPTIONS,
		...userOpts
	};
	// Step One: process files into DATED_POSTS and PAGES
	const DATED_POSTS = {};
	const PAGES = {};

	const markA = Date.now();
	await Promise.all(opts.contentPaths.map(processFilesFromPath(DATED_POSTS, PAGES, opts.config)));

	getAllPosts = () => ({ PAGES, DATED_POSTS });
	let ORDERED_POSTS = [];
	if (Object.keys(DATED_POSTS).length) {
		ORDERED_POSTS = createAndGetSortedPosts(PAGES, DATED_POSTS, opts.config);
		const RECENT_POSTS = ORDERED_POSTS.slice(0, POST_LIMIT);

		await Promise.all([
			createPages(PAGES, opts.config),
			createLatest(PAGES, RECENT_POSTS, opts.config),
			createArchive(PAGES, ORDERED_POSTS, opts.config),
			createFeeds(RECENT_POSTS, opts.feed),
			copyStatic(opts.config.static, opts.config.publish)
		]);
	}
	const markB = Date.now();
	// eslint-disable-next-line no-console
	console.log(`Built ${ORDERED_POSTS.length} Posts & ${Object.keys(PAGES).length} Pages in ${(markB - markA) / MILLISECONDS} seconds`);
};

export { getAllPosts };
export default build;
