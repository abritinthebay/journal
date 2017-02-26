import visit from "unist-util-visit";

const citeNode = (classNames = [], value = "") => ({
	type: "cite",
	tagName: "cite",
	properties: {
		tagName: "cite",
		className: ["token", "blockcite", ...classNames]
	},
	data: {
		hProperties: {
			className: ["token", "blockcite", ...classNames]
		}
	},
	children: [
		{
			type: "text",
			value
		}
	]
});

function visitor(node){
	if (node.children) {
		const lastChild = node.children[node.children.length - 1];
		if (lastChild.children) {
			const lastGrandChild = lastChild.children[lastChild.children.length - 1];
			if (lastGrandChild.type === "linkReference") {
				lastChild.children.pop();
				lastChild.children.push(citeNode(["quoteCite"], lastGrandChild.label));
			}
		}
	}
}

function Blockcite(){
	return ast => visit(ast, "blockquote", visitor);
}

export default Blockcite;
