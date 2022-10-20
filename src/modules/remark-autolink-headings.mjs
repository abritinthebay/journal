
import { visit } from "unist-util-visit";

const behaviors = { prepend: "unshift", append: "push" };
const contentDefaults = {
	type: "element",
	tagName: "span",
	properties: { className: ["icon", "icon-link"]}
};

const defaults = { behavior: "prepend", content: contentDefaults, ignore: []};

function inject(node, url, { behavior, hChildren, linkProperties }){
	node.children[behaviors[behavior]]({
		type: "link",
		url,
		title: null,
		children: [],
		data: {
			hProperties: { ...linkProperties },
			hChildren: Array.from(hChildren)
		}
	});
}

function wrap(node, url, { linkProperties }){
	node.children = [
		{
			type: "link",
			url,
			title: null,
			children: node.children,
			data: {
				hProperties: { ...linkProperties }
			}
		}
	];
}

const attacher = (opts = {}) => {
	const allOpts = { ...defaults, ...opts };
	const { behavior, content, ignore } = allOpts;
	const method = behavior === "wrap" ? wrap : inject;
	const hChildren = method === inject ?
		Array.isArray(content) ? content : [content]
		: [];
	const linkProperties = method === inject && !allOpts.linkProperties ?
		{ ariaHidden: "true" }
		: allOpts.linkProperties;

	const obj = { behavior, hChildren, linkProperties };

	function visitor(node){
		const id = node.data && node.data.hProperties && node.data.hProperties.id;
		if (id) {
			method(node, `#${id}`, obj);
		}
	}

	const test = node => node.type === "heading" && !ignore.includes(node.depth);
	return ast => visit(ast, test, visitor);
};

export default attacher;
