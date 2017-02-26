import Refractor from "refractor";
import visit from "unist-util-visit";

const textNode = (value = "") => ({ type: "text", value });
const spanNode = (classNames = [], value = "") => ({
	type: "element",
	tagName: "span",
	properties: {
		className: ["token", ...classNames]
	},
	children: [{ type: "text", value }]
});
const quoteNode = (quoteChar = "\"") => spanNode(["quote"], quoteChar);
const lineStartNode = spanNode(["lineStart"]);
const lineEndNode = spanNode(["lineEnd"]);
const newLineNodes = [lineEndNode, textNode("\n"), lineStartNode];

const hasValue = node => (...matches) => node.children.some(child => matches.reduce((acc, match) => child.value === match || acc, false));
const hasClassName = node => node.properties && node.properties.className && Array.isArray(node.properties.className);
const isToken = node => test => hasClassName(node) && node.properties.className.includes(test) && Array.isArray(node.children);

const getNodeFuncs = node => ({
	nodeHas: hasValue(node),
	nodeIsToken: isToken(node)
});

const wrapNode = (nodes, skip) => (index = 0) => skip ? nodes : nodes.splice(index, 0, index > 0 ? lineEndNode : lineStartNode);

function addLines(nodes, skipWrapping = false){
	const wrapAt = wrapNode(nodes, skipWrapping);
	wrapAt(0);
	const clone = Array.from(nodes);
	let offset = 0;
	clone.forEach((_node, index) => {
		const correctIndex = index + offset;
		const node = nodes[correctIndex];
		if (node.type === "text" && node.value.indexOf("\n") >= 0) {
			const total = node.value.split(/\n/g);
			const newNodes = total.reduce((acc, str, idx) => {
				const appendNodes
					= idx === 0 && str.length > 0 ? [textNode(str)]
						: str.length !== 0 ? [...newLineNodes, textNode(str)]
							: total[idx - 1] === "" && total[idx - 1].length === 0 ? newLineNodes
								: [];
				acc.push(...appendNodes);
				return acc;
			}, []);
			nodes.splice(correctIndex, 1, ...newNodes);
			offset += newNodes.length - 1;
		}
	});
	wrapAt(nodes.length);
}

const punctuationClass = nodeHas => nodeHas(";") ? "semicolon"
	: nodeHas("(", ")") ? "parentheses"
		: nodeHas("{", "}") ? "brace"
			: nodeHas("[", "]") ? "bracket"
				: nodeHas(":") ? "colon"
					: "";

const keywordClass = nodeHas => nodeHas("function") ? "function"
	: nodeHas("const") || nodeHas("let") || nodeHas("var") ? "variable"
		: nodeHas("class") ? "class-declare"
			: "";

const processString = children => {
	switch (children[0].value[0]) {
		case "'":
			children[0].value = children[0].value.replace(/'/g, "");
			children.unshift(quoteNode("'"));
			children.push(quoteNode("'"));
			return "singlequote";
		case "\"":
			children[0].value = children[0].value.replace(/"/g, "");
			children.unshift(quoteNode("\""));
			children.push(quoteNode("\""));
			return "doublequote";
		default:
			return "";
	}
};

const getNewNodes = (nodes, correctIndex) => {
	const newNodes = nodes[correctIndex - 1].value
		.split(/\b/g)
		.reduce((acc, value) => {
			acc.push(/\s/g.test(value) ? textNode(value) : spanNode(["object-property"], value));
			return acc;
		}, []);
	nodes.splice(correctIndex - 1, 1, ...newNodes);
	return newNodes;
};

function processNodes(nodes){
	const clone = Array.from(nodes);
	let offset = 0;
	clone.forEach((_node, index) => {
		const node = nodes[index + offset];
		const { nodeHas, nodeIsToken } = getNodeFuncs(node);
		const { children, properties: { className = []} = {} } = node;
		const newClass = nodeIsToken("punctuation") ?
			punctuationClass(nodeHas)
			: nodeIsToken("keyword") ?
				keywordClass(nodeHas)
				: nodeIsToken("string") ?
					processString(children)
					: "";
		if (nodeIsToken("template-string")) {
			children.forEach(childNode => addLines(childNode.children, true));
		}
		if (nodeIsToken("punctuation") && newClass === "colon" && nodes[index + offset - 1].type === "text") {
			offset += getNewNodes(nodes, index + offset).length - 1;
		}
		if (newClass) {
			className.push(newClass);
		}
	});
}

const handlePairs = elem => {
	switch (elem.children[0].value) {
		case "{":
			return "leftbrace";
		case "}":
			return "rightbrace";
		case "(":
			return "leftparen";
		case ")":
			return "rightparen";
		case "[":
			return "leftbracket";
		case "]":
			return "rightbracket";
		case "<":
			return "lt";
		case ">":
			return "gt";
		default:
			return false;
	}
};

const handleMisc = elem => {
	switch (elem.children[0].value) {
		case ";":
			return "semicolon";
		case ",":
			return "comma";
		case ".":
			return "period";
		case "'":
			return "singlequote";
		case "\"":
			return "quote";
		case "<!":
			return "mdo"; // SGML "markup declaration open"
		case "</":
			return "endtag";
		case "/>":
			return "selfclose";
		default:
			return false;
	}
};

const processPunctuation = node => {
	const hasHTMLchildren = elem => elem.hChildren.length > 0;
	const isPunctuation = elem => elem.properties && elem.properties.className && elem.properties.className.includes("punctuation");
	visit(node.data, hasHTMLchildren, token => {
		token.hChildren.forEach(child => {
			visit(child, isPunctuation, elem => {
				const newClass = handlePairs(elem) || handleMisc(elem);
				if (newClass && !elem.properties.className.includes(newClass)) {
					elem.properties.className.push(newClass);
				}
			});
		});
	});
};

const prismNodeData = node => node ? {
	...node.data || {},
	hProperties: {
		...node.data && node.data.hProperties || {},
		className: [...node.data && node.data.hProperties && node.data.hProperties.className || [], `language-${node.lang}`]
	}
} : {};

const codeVisitor = node => {
	node.data = prismNodeData(node);
	node.data.hChildren = Refractor.highlight(node.value, node.lang || "js");
	delete node.value;
	node.data.hChildren.forEach(child => {
		if (child.properties) {
			const props = child.properties;
			if (props.className.includes("keyword")) {
				if (child.children[1]) {
					props.componentname = child.children[1].value.trim();
				}
				if (child.children[2]) {
					props.url = child.children[2].children[0].value.replace(/"/g, "");
				}
			}
			if (props.className.includes("operator")) {
				child.children[0].value = child.children[0].value.replace(">", "&gt;");
				child.children[0].value = child.children[0].value.replace("<", "&lt;");
			}
		}
	});

	processNodes(node.data.hChildren);
	processPunctuation(node);
	addLines(node.data.hChildren);
};

const inlineVisitor = node => {
	node.value = node.value.replace(">", "&gt;");
	node.value = node.value.replace("<", "&lt;");
};

const prism = _options => ast => {
	visit(ast, "code", codeVisitor);
	visit(ast, "inlineCode", inlineVisitor);
};
export default prism;
