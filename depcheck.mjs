import depcheck from "depcheck";
import path from "path";

const options = {
	skipMissing: false,
	ignoreDirs: [
		"./node_modules",
		"./build"
	],
	parsers: { // The target parsers
		"*.js": depcheck.parser.es6,
		"*.mjs": depcheck.parser.es6
	},
	detectors: [ // The target detectors
		depcheck.detector.exportDeclaration,
		depcheck.detector.importDeclaration
	],
	specials: [ // The target special parsers
		depcheck.special.eslint,
		depcheck.special.bin,
		depcheck.special.jest
	]
};

/* eslint-disable no-process-exit, no-console, promise/avoid-new */
const checkMissing = missing => {
	if (Object.entries(missing).length > 0) {
		console.log("  \x1b[4m\x1b[31m%s\x1b[0m \x1b[31m\x1b[2m%s\x1b[0m", "Missing", "You might want to install these.");
		Object.entries(missing).forEach(([dep, where]) => {
			console.log("    \x1b[1m* \x1b[31m%s\x1b[0m \x1b[41m\x1b[30m %s \x1b[0m", dep, "missing");
			console.log("      seen in:\n      \x1b[1m%s\x1b[0m", where.join("\n"));
		});
		console.log("");
	}
};

const checkDeps = deps => {
	if (deps.length > 0) {
		console.log("  \x1b[4m\x1b[31m%s\x1b[0m \x1b[31m\x1b[2m%s\x1b[0m", "Unused", "You probably should remove these.");
		deps.forEach(dep => {
			console.log("    \x1b[1m* \x1b[31m%s\x1b[0m \x1b[2m%s\x1b[0m", dep, "unused");
		});
		console.log("");
	}
};

const checkDevDeps = deps => {
	if (deps.length > 0) {
		console.log("  \x1b[4m\x1b[33m%s\x1b[0m \x1b[33m\x1b[2m%s\x1b[0m", "Unused devDependencies", "You might want to install these.");
		deps.forEach(dep => {
			console.log("    \x1b[1m* \x1b[4m\x1b[33m%s\x1b[0m \x1b[2m%s\x1b[0m", dep, "unused devDependency");
		});
		console.log("");
	}
};

const app = async() => {
	console.log("Checking dependencies...\n");
	const keepalive = await new Promise(() => {
		depcheck(path.join(path.resolve(), "./"), options, deps => {
			checkMissing(deps.missing);
			checkDeps(deps.dependencies);
			checkDevDeps(deps.devDependencies);

			if (Object.entries(deps.missing).length > 0 || deps.dependencies.length > 0 || deps.devDependencies.length > 0) {
				console.log("  \x1b[31m%s\x1b[0m", "There are dependencies needing your attention. :(\n");
				process.exit(1);
			} else {
				console.log("  \x1b[32m%s\x1b[0m", "Your dependencies look great! Nice work. :)\n");
			}
		});
	});
	return keepalive; // This sneaky bullshit with await and a return value keeps Node from quitting immediately with an async funcation
};
/* eslint-enable no-process-exit, no-console, promise/avoid-new */

app();
