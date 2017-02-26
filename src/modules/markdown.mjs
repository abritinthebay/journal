import remark from "remark";
import abbr from "remark-abbr";
import emoji from "remark-emoji";
import footnote from "remark-footnotes";
import frontmatter from "remark-frontmatter";
import sectionize from "remark-sectionize";
import slug from "remark-slug";

import autolink from "./remark-autolink-headings.mjs";
import quotecite from "./remark-blockcite.mjs";
import extractFrontmatter from "./remark-extract-frontmatter.mjs";
import extractTitle from "./remark-extract-title.mjs";
import prism from "./remark-prism.mjs";
import render from "./remark-render.mjs";

const remarkSettings = { footnotes: true };
const plugins = [
	frontmatter,
	extractTitle,
	extractFrontmatter,
	abbr,
	emoji,
	slug,
	[autolink, { ignore: [1], linkProperties: { ariaHidden: "true", ariaLabel: "heading anchor", title: "heading anchor", tabindex: -1, class: "headinglink" } }],
	prism,
	sectionize,
	quotecite,
	[footnote, { inlineNotes: true }]
];
const converge = (target, branches) => input => target(...branches.map(branch => branch(input)));
const applyPluginsTo = processor => (plugs = []) => plugs.reduce((proc, plugin) => Array.isArray(plugin) ? proc.use(plugin[0], plugin[1]) : proc.use(plugin), processor);
const applySettingsTo = processor => (settings = {}) => processor.data("settings", settings);
const processMarkdownWith = processor => async markdown => processor.process(markdown);
const decorator = (addPlugins, updateSettings, textProcess) => plugs => settings => markdown => addPlugins(plugs) && updateSettings(settings) && textProcess(markdown);

const bindWith = converge(decorator, [applyPluginsTo, applySettingsTo, processMarkdownWith]);

const convertToMarkdown = (opts = { plugins: [], settings: {}, components: {} }) => {
	const instancePlugins = [...plugins, ...opts.plugins, render];
	const instanceSettings = { ...opts.settings, ...remarkSettings };
	return async markdown => {
		const vfile = await bindWith(remark())(instancePlugins)(instanceSettings)(markdown);
		return {
			content: vfile.contents,
			frontmatter: vfile.data.frontmatter || {}
		};
	};
};

export default convertToMarkdown;
