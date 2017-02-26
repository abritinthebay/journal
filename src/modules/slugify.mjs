const fx = (val, fn) => fn(val);
const compose = fs => input => fs.reduceRight(fx, input);

const punctuation = /[!"#$%&'()*,./:;=?\\^_`{}~’-]/g;
const toLowerCase = str => str.toLowerCase();
const splitOnWhiteSpace = str => str.split(/\s/g);
const filterPunctuation = arr => arr.map(word => word.replace(punctuation, ""));
const joinWithDash = arr => arr.join("-");
const makeDense = sparse => sparse.filter(item => typeof item !== "undefined" && item !== null && item !== "");

const slugify = compose([
	joinWithDash,
	makeDense,
	filterPunctuation,
	splitOnWhiteSpace,
	toLowerCase
]);

export default slugify;
