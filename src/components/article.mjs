import title from "./title.mjs";

const Article = ({ uniqueId, isList, content, frontmatter, date }) => `
<article class="blog-${frontmatter.type}" id="${uniqueId}">
	${title({ date, frontmatter, isList, type: frontmatter.type })}
	${content}
</article>`;

export default Article;
