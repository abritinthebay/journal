import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import allFS from "fs";
import postcss from "postcss";
import postcssPresetEnv from "postcss-preset-env";
import precss from "precss";

const fs = allFS.promises;

const compressCSS = async(from, to) => {
	const css = await fs.readFile(from);
	const result = await postcss([
		postcssPresetEnv,
		autoprefixer,
		precss,
		cssnano
	])
		.process(css, { from, to });

	await fs.writeFile(to, result.css);
	if (result.map) {
		await fs.writeFile(`${to}.map`, result.map);
	}
};

export default compressCSS;
