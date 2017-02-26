import allFS from "fs";

import compressCSS from "./css.mjs";

const fs = allFS.promises;

const copyStatic = async(inputPath, outputPath) => {
	if (!inputPath || !outputPath) {
		/* eslint-disable-next-line no-console */
		console.log("No static path: will not copy files.");
		return false;
	}
	const files = await fs.readdir(inputPath, { withFileTypes: true });

	return Promise.all(files.map(file => {
		const input = `${inputPath}/${file.name}`;
		const output = `${outputPath}/${file.name}`;
		return file.isDirectory() ?
			fs.mkdir(output, { recursive: true }) && copyStatic(input, output, true)
			: file.name.endsWith(".css") ?
				compressCSS(input, output)
				: fs.copyFile(input, output);
	}));
};

export default copyStatic;
