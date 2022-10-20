import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import allFS from "fs";
import postcss from "postcss";
// The below are a replacement for the abandoned precss module
import postcssAdvancedVariables from "postcss-advanced-variables";
import postcssAtroot from "postcss-atroot";
import postcssExtendRule from "postcss-extend-rule";
import postcssNested from "postcss-nested";
import postcssPresetEnv from "postcss-preset-env";
import postcssPropertyLookup from "postcss-property-lookup";

const fs = allFS.promises;
const precss = [postcssExtendRule, postcssAdvancedVariables, postcssPresetEnv, postcssAtroot, postcssPropertyLookup, postcssNested]; // Plugin

const compressCSS = async(from, to) => {
	const css = await fs.readFile(from);
	const result = await postcss([
		postcssPresetEnv,
		autoprefixer,
		...precss,
		cssnano
	])
		.process(css, { from, to });

	await fs.writeFile(to, result.css);
	if (result.map) {
		await fs.writeFile(`${to}.map`, result.map);
	}
};

export default compressCSS;
