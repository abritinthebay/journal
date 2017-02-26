
/*
 * Title Case Rules:
 * Three major styles: AP, Chicago, APA/MLA.
 * Oxford & Cambridge both are silent on the specific differences amongst the 3,
 * though in use appears to be similar to Chicago with longer prepositions commonly lowercased.
 *
 * In all 3 styles, always capitalize the first and last word of any title.
 * In all 3 styles, you must capitalize nouns, pronouns, verbs, adjectives, and adverbs.
 * In all 3 styles, do not capitalize articles, prepositions, or coordinating conjunctions.
 *
 * Style guide differences:
 *
 * In the AP Stylebook, all words with three letters or less are lowercased. However, if any of those short words are verbs (is, are, was, be), they are to be capitalized.
 * In Chicago style, all prepositions are lowercased, even the lengthier ones, such as between, among, throughout.
 * In APL/MLA style, words with three letters or less are always lowercased.
 *
 * Additionally The U.S. Government Printing Office Style Manual suggests:
 * "Capitalize all words in titles of publications and documents,
 * except a, an, the, at, by, for, in, of, on, to, up, and, as, but, or, and nor."
 * This is mostly consistient with other styles.
 *
 * The following is not a perfect implementation of the above but it's closest to AP.
 * It has some specific checks for subtitle/subclause and urls
 */

const smallWords = /^(a|an|and|as|at|but|by|for|from|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via|with)$/i;
const wordSeparators = /(?<separators>[\s-:‑–—])/;
const alphanumericPattern = /(?<alphanum>[\dA-Za-z\u00C0-\u00FF])/;
const intentionalCapitalsAndPunc = /[A-Z]|(?=.)\.(?!'|")/;

const titleCase = (str, _style) => str.split(wordSeparators)
	.map((current, index, array) => {
		const notFirstOrLast = index !== 0 && index !== array.length - 1;
		const notStartingHyphenatedPhrase = array[index - 3] !== ":";
		const notEndingHyphenatedPhrase = array[index + 1] !== ":";
		const preceededByHTTP = array[index - 3] === ":" && array[index - 4] === "http";
		const isColonSafe = (notStartingHyphenatedPhrase || preceededByHTTP) && notEndingHyphenatedPhrase;
		const notStartingHyphenate = array[index + 1] !== "-" || array[index - 1] === "-" && array[index + 1] === "-";
		const isProbablyURL = array[index + 1] === ":" && array[index + 2] !== "";
		const intentionallyCapitalized = current.substr(1).search(intentionalCapitalsAndPunc) > -1;
		const hasSmallWords = current.search(smallWords) >= 0;
		const isNumber = /^\d/.test(current);
		const ignorableSmallWord = hasSmallWords && notFirstOrLast && isColonSafe && notStartingHyphenate;
		const speciallyFormatted = intentionallyCapitalized || isProbablyURL || isNumber;

		return ignorableSmallWord ?
			current.toLowerCase()
			: speciallyFormatted ?
				current
				: current.replace(alphanumericPattern, match => match.toUpperCase());
	})
	.join("");

export default titleCase;
