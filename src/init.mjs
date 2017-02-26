import path from "path";

import build from "./build.mjs";

const getFeed = async config => ({
	outputPath: path.resolve(`${config.publish}/feed/`),
	copyright: config.copyright,
	feedUrl: `${config.url}/feed/`,
	title: config.title,
	description: config.description,
	id: config.url,
	url: config.url,
	lang: config.lang,
	author: config.author
});

const getBuildOpts = async config => {
	const feed = await getFeed(config);
	return {
		contentPaths: [path.join(config.inputPath, "./posts/"), path.join(config.inputPath, "./pages/")],
		config,
		feed
	};
};


const init = async function init(config){
	/* eslint-disable-next-line no-console */
	console.log("Starting to build the site...");
	const buildOpts = await getBuildOpts(config);
	return build(buildOpts);
};

export default init;
