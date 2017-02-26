import dateLine from "./dateline.mjs";

const linkTitle = ({ frontmatter, text, titleTag, isList }) => {
	const permalink = isList ?
		`<a aria-label="permalink to post" class="permalink" href="${frontmatter.permalink}" title="permalink"> </a>`
		: "";
	return `<${titleTag} class="link-title"><a href="${frontmatter.link}">${text}</a>${permalink}</${titleTag}>`;
};

const articleTitle = ({ frontmatter, text, date, sub, titleTag, showDate, isList }) => {
	const content = isList ? `<a href="${frontmatter.permalink}">${text}</a>` : text;
	const dateTime = showDate ? `${dateLine({ date, key: date.getTime() })}` : "";
	return `<${titleTag} class="post-title">${content}${sub}</${titleTag}>${dateTime}`;
};

const Title = ({ type, isList, frontmatter, date, showDate = true, tag = "h1", subtitle }) => {
	const titleTag = tag;
	const text = (frontmatter.extractedTitle || frontmatter.title).replace(" & ", " &amp; ");
	const sub = subtitle ? `<span class="sub">${subtitle}</span>` : "";
	switch (type) {
		case "link": {
			return linkTitle({ frontmatter, text, titleTag, isList });
		}
		case "article": {
			return articleTitle({ frontmatter, text, titleTag, isList, date, sub, showDate });
		}
		default:
			return `<${titleTag}>${text}</${titleTag}>`;
	}
};

export default Title;
