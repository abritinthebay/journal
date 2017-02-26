import remove from "unist-util-remove";
import utilSelect from "unist-util-select";
import yaml from "yaml";

import slugify from "./slugify.mjs";
import titleCase from "./title-case.mjs";

const { select } = utilSelect;

const addToYAML = (ast, title, slug) => {
	const yamlNode = select("yaml", ast);
	if (yamlNode && yamlNode.value) {
		const data = yaml.parse(yamlNode.value);
		const titleData = data.title || title;
		const yamlData = {
			...data,
			title: titleData,
			slug: data.slug || slugify(titleData) || slug
		};
		if (title) {
			yamlData.extractedTitle = title;
		}
		yamlNode.value = yaml.stringify(yamlData);
	}
};

const getAndRemoveTitle = (ast, elem) => {
	const title = titleCase(elem.value);
	const slug = slugify(title);
	ast.title = title;
	ast.slug = slug;
	remove(ast, { type: "heading", depth: 1 });
	return ast;
};

function ExtractTitle(){
	return ast => {
		const elem = select("heading[depth=1] text", ast);
		if (elem) {
			const { title, slug } = getAndRemoveTitle(ast, elem);
			/*
			 * Support for frontmatter.
			 * Will only add to frontmatter.title if title does not exist there.
			 * though will add additional field for the extracted Title
			 */
			addToYAML(ast, title, slug);
		} else {
			addToYAML(ast);
		}
		return ast;
	};
}

export default ExtractTitle;
