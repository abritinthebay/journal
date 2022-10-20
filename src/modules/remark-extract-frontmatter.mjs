import { remove } from "unist-util-remove";
import { visit } from "unist-util-visit";
import YAML from "yaml";

const pad = num => num < 10 ? `0${num}` : `${num}`;

const frontVisitor = file => node => {
	const front = YAML.parse(node.value);
	front.title = !front.title && node.title ? node.title : front.title;
	front.slug = !front.slug && node.slug ? node.slug : front.slug;
	const created = new Date(front.date || 0);
	const year = created.getFullYear();
	const month = pad(created.getMonth() + 1);
	const date = pad(created.getDate());
	let url = `/${year}/${month}/${date}/${front.slug}.html`;
	if (front.type === "page") {
		url = front.permalink || `/${front.slug}.html`;
	} else if (front.type === "subpage") {
		url = front.permalink || `/${front.parent}/${front.slug}.html`;
	} else if (front.type === "link") {
		url = `/link${url}`; // Already has a trailing slash
	}
	front.permalink = url;
	file.data.frontmatter = front;
};

const frontTransformer = (ast, file) => {
	visit(ast, "yaml", frontVisitor(file));
	remove(ast, { type: "yaml" });
};

const ExtractFrontmatter = () => frontTransformer;

export default ExtractFrontmatter;
