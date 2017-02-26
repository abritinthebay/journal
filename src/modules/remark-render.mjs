import sanitize from "hast-util-sanitize";
import toHtml from "hast-util-to-html";
import toHAST from "mdast-util-to-hast";
import unist from "unist-builder";
import visit from "unist-util-visit";

/*
 * Image Constants
 */

const BASE_DPR = 1;
const XSMALL_DPR = 1.5;
const SMALL_DPR = 2;
const MEDIUM_DPR = 2.5;
const LARGE_DPR = 3;
const XLARGE_DPR = 3.5;
const MAX_DPR = 4;

const IMG_WIDTH = 600;
const BASE_IMG_WIDTH = IMG_WIDTH * BASE_DPR;
const XSMALL_IMG_WIDTH = BASE_IMG_WIDTH * XSMALL_DPR;
const SMALL_IMG_WIDTH = BASE_IMG_WIDTH * SMALL_DPR;
const MEDIUM_IMG_WIDTH = BASE_IMG_WIDTH * MEDIUM_DPR;
const LARGE_IMG_WIDTH = BASE_IMG_WIDTH * LARGE_DPR;
const XLARGE_IMG_WIDTH = BASE_IMG_WIDTH * XLARGE_DPR;
const MAX_IMG_WIDTH = BASE_IMG_WIDTH * MAX_DPR;

/*
 * Cloudinary URL format:
 * https://res.cloudinary.com/<cloud_name>/<resource_type>/<type>/<transformations>/<version>/<public_id>.<format>
 */
const imgUrl = (file, width = "auto", cloud = "gregoryws") => encodeURI(`https://res.cloudinary.com/${cloud}/image/upload/t_base_transform/c_fill,f_auto,w_${width},g_auto:subject,dpr_auto/${file}`);

const processImages = hast => {
	visit(hast, { tagName: "img" }, img => {
		const { src } = img.properties;
		img.properties.decoding = "async";
		img.properties.src = imgUrl(src, BASE_IMG_WIDTH);
		img.properties.srcSet = `
		${imgUrl(src, BASE_IMG_WIDTH)} ${BASE_IMG_WIDTH}w,
		${imgUrl(src, XSMALL_IMG_WIDTH)} ${XSMALL_IMG_WIDTH}w,
		${imgUrl(src, SMALL_IMG_WIDTH)} ${SMALL_IMG_WIDTH}w,
		${imgUrl(src, MEDIUM_IMG_WIDTH)} ${MEDIUM_IMG_WIDTH}w,
		${imgUrl(src, LARGE_IMG_WIDTH)} ${LARGE_IMG_WIDTH}w,
		${imgUrl(src, XLARGE_IMG_WIDTH)} ${XLARGE_IMG_WIDTH}w,
		${imgUrl(src, MAX_IMG_WIDTH)} ${MAX_IMG_WIDTH}w`;
	});
};

function footnoteReference(hast, node){
	const { footnoteById, footnoteOrder } = hast;
	const identifier = String(node.identifier);
	const orderIndex = footnoteOrder.indexOf(identifier);
	/*
	 * Now we fixup the identifier so they all link to their order id.
	 * This seems strange - that's because this is how Remark handles he footnote footer.
	 * It's all done inside the core mdast renderer, so we update the values used by it.
	 */
	if (orderIndex === -1) {
		footnoteOrder.push(identifier);
		footnoteById[identifier.toUpperCase()].identifier = String(footnoteOrder.length);
	} else {
		node.identifier = `${orderIndex + 1}`;
	}

	const footnotePosition = footnoteOrder.indexOf(identifier) + 1;
	const foo = hast(
		node.position,
		"sup",
		{ "id": `fnref-${ footnotePosition}`, "className": ["footnote-ref"]},
		[
			hast(
				node,
				"a",
				{
					"href": `#fn-${ footnotePosition}`,
					"className": ["footnote-ref"],
					"ariaLabel": `footnote ${footnotePosition}`
				},
				[unist("text", footnotePosition)]
			)
		]
	);
	return foo;
}

const footnote = (hast, node) => {
	const { footnoteById, footnoteOrder } = hast;
	const identifier = `__FOOTNOTE-${footnoteOrder.length + 1}`;
	/*
	 * No need to check if `identifier` exists in `footnoteOrder`.
	 * We just generated it.
	 */
	footnoteOrder.push(identifier);

	footnoteById[identifier] = {
		type: "footnoteDefinition",
		identifier: footnoteOrder.length,
		children: [{ type: "paragraph", children: node.children }],
		position: node.position
	};

	return footnoteReference(hast, {
		type: "footnoteReference",
		identifier,
		position: node.position
	});
};

const processFootnotes = (hast, file) => {
	if (hast.children) {
		const { frontmatter } = file.data;
		const prefix = frontmatter.type === "page" || frontmatter.type === "subpage" ? "page" : new Date(frontmatter.date).getTime();
		const uniq = `${prefix}-${frontmatter.slug}`;
		const footnoteRefTest = node => node.tagName === "sup" && node.properties.className && node.properties.className.includes("footnote-ref");
		const footnoteBlockTest = node => node.children && node.type === "element" && node.properties.className && node.properties.className.includes("footnotes");
		const backrefTest = node => node.tagName === "a" && node.properties.className && node.properties.className.includes("footnote-backref");
		visit(hast, footnoteBlockTest, block => {
			block.children = block.children.filter(child => child.tagName !== "hr");
			visit(block, { tagName: "li" }, item => {
				item.properties.id = `${uniq}-${item.properties.id}`;
			});
		});
		visit(hast, footnoteRefTest, note => {
			note.properties.id = `${uniq}-${note.properties.id}`;
			visit(note, { tagName: "a" }, link => {
				link.properties.href = `#${uniq}-${link.properties.href.slice(1)}`;
			});
		});
		visit(hast, backrefTest, link => {
			if (link.properties.className && link.properties.className.includes("footnote-backref")) {
				link.properties.href = `#${uniq}-${link.properties.href.slice(1)}`;
				link.properties.ariaLabel = "Go back to footnote location in text";
				link.children[0].value = "⤿"; // "⌃"; // "⤾";
			}
		});
	}
};

const pullquotes = (ast, file) => {
	if (file.data.frontmatter && file.data.frontmatter.slug === "foo-bar-baz") {
		visit(ast, "blockquote", quote => {
			if (quote.children[0].children && quote.children[0].children[0].type === "text") {
				const { children: [{ children: [textNode] }] } = quote;
				if (textNode.value.startsWith("->")) {
					textNode.value = textNode.value.replace(/(->)+\s*/, "");
					quote.properties = quote.properties || {};
					quote.properties.className = quote.properties.className || [];
					quote.properties.className.push("pullquote");
					quote.data = quote.data || {};
					quote.data.hProperties = quote.data.hProperties || {};
					quote.data.hProperties.className = quote.data.hProperties.className || [];
					quote.data.hProperties.className.push("pullquote");
				}
			}
		});
	}
};

const cite = (hast, node) => {
	const newCite = hast(
		node.position,
		node.tagName,
		{ "className": node.properties.className },
		node.children
	);
	return newCite;
};

const tableCellStyle = hast => visit(hast, elem => ["th", "td"].includes(elem.tagName), tableItem => {
	// Remark adds outdated visual attritubes to tables. Lets fix that.
	if (tableItem.properties) {
		if (tableItem.properties.align) {
			tableItem.properties.className = tableItem.properties.className || [];
			tableItem.properties.className.push(tableItem.properties.align);
		}
		if (tableItem.properties.valign) {
			tableItem.properties.className = tableItem.properties.className || [];
			tableItem.properties.className.push(tableItem.properties.valign);
		}
		delete tableItem.properties.align;
		delete tableItem.properties.valign;
		delete tableItem.properties.width;
		delete tableItem.properties.height;
	}
	if (tableItem.tagName === "th") {
		tableItem.properties.scope = "auto";
	}
});

const DUMB_HAST_TO_HTML_REPLACEMENT = "%%%%_REPLACE_WITH_AMP_%%%%";
const HAST_REPLACEMENT_REGEX = new RegExp(DUMB_HAST_TO_HTML_REPLACEMENT, "g");

const codeTest = elem => elem.tagName === "span" && elem.properties.className && elem.properties.className.includes("token") && elem.properties.className.includes("punctuation");
const prepCodePunctuation = hast => visit(hast, codeTest, token => {
	switch (token.children[0].value) {
		case "<!":
			token.children[0].value = `${DUMB_HAST_TO_HTML_REPLACEMENT}lt;!`; // SGML "markup declaration open"
			break;
		case "</":
			token.children[0].value = `${DUMB_HAST_TO_HTML_REPLACEMENT}lt;/`;
			break;
		case "/>":
			token.children[0].value = `/${DUMB_HAST_TO_HTML_REPLACEMENT}gt;`;
			break;
		case "<":
			token.children[0].value = `${DUMB_HAST_TO_HTML_REPLACEMENT}lt;`;
			break;
		case ">":
			token.children[0].value = `${DUMB_HAST_TO_HTML_REPLACEMENT}gt;`;
			break;
		default:
			break;
	}
});

const fixHAST = hast => {
	tableCellStyle(hast);
	prepCodePunctuation(hast);
};

const fixHTML = (html, isRoot) => {
	const noEOF = html.charAt(html.length - 1) !== "\n";
	// Fixing stupid hast-to-html substituion that it doesn't allow you to fix.
	return `${html.replace(HAST_REPLACEMENT_REGEX, "&")}${isRoot && noEOF ? "\n" : ""}`;
};

function HTML(options){
	const settings = options || {};
	const clean = settings.sanitize;
	const schema = clean && typeof clean === "object" ? clean : null;
	const handlers = settings.handlers || {};

	const toHastOptions = {
		...settings.hastOptions || {},
		allowDangerousHtml: !clean,
		handlers: {
			cite,
			footnote,
			footnoteReference,
			...handlers
		}
	};

	function compiler(node, file){
		const isRoot = node && node.type && node.type === "root";
		let hast = toHAST(node, toHastOptions);

		if (file.extname) {
			file.extname = ".html";
		}

		if (clean) {
			hast = sanitize(hast, schema);
		}

		processFootnotes(hast, file);
		processImages(hast, file);
		fixHAST(hast);

		const result = toHtml(hast, { ...settings, useNamedReferences: false, allowDangerousHtml: !clean });
		return fixHTML(result, isRoot);
	}

	this.Compiler = compiler;

	return pullquotes;
}

export default HTML;
