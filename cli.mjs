#!/usr/bin/env node
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs/yargs";

import journal from "./index.mjs";
import colors from "./src/colors.mjs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJSON = JSON.parse(readFileSync(path.resolve(dirname, "./package.json")));

const yarg = yargs(process.argv.slice(2))
	.scriptName("journal")
	.version(packageJSON.version)
	.usage("Usage: $0 [args]")
	.help("h")
	.alias("h", "help")
	.alias("v", "version")
	.example("$0", "(basic usage, uses defaults)")
	.example("$0 --config myconfig.js", "(use a custom config file)")
	.example("$0 -i markdown", "(use a custom content directory 'markdown')")
	.default("c", "journal.json", "<current dir>/journal.json")
	.alias("c", "config")
	.default("i", "content", "<current dir>/content/")
	.alias("i", "input")
	.default("o", "build", "<current dir>/build/")
	.alias("o", "output")
	.default("s", "static", "<current dir>/static/")
	.alias("s", "static")
	.epilog("");

const { log } = console;
const color = (text, col) => `${col}${text}${colors.Reset}`;

const titleTemplate = `${color(`     _                              _ 
    | | ___  _   _ _ __ _ __   __ _| |
 _  | |/ _ \\| | | | '__| '_ \\ / _\` | |
| |_| | (_) | |_| | |  | | | | (_| | |
 \\___/ \\___/ \\__,_|_|  |_| |_|\\__,_|_|`, `${colors.FgGreen}`)}
Journal v${packageJSON.version}. ${color("A static blog generator", colors.FgCyan)}.
`;

function getConfig(args){
	log(`Loading journal config from ${color(args.config, colors.FgBlue)}`);
	let config = {};
	try {
		config = JSON.parse(readFileSync(path.resolve(args.config)));
	} catch (err) {
		log(`${color("ERROR: Could not load config, make sure the file exists!", colors.FgRed)}\n`);
		process.exit(1); // eslint-disable-line no-process-exit
	}
	config.inputPath = path.resolve(config.inputPath || args.input);
	config.static = path.resolve(config.static || args.static);
	config.publish = path.resolve(config.publish || args.output);
	return config;
}


async function cli(){
	log(titleTemplate);
	const args = yarg.argv;
	const config = getConfig(args);
	log(`Building ${color(config.title, colors.FgGreen)}`);
	const buildStats = await journal(config);
	log(`

  Built:
   - ${color(buildStats.postCount, colors.FgGreen)} Posts
   - ${color(buildStats.pageCount, colors.FgGreen)} Pages
  in ${color(buildStats.time, colors.FgGreen)} seconds

  The site was exported to: ${color(`${config.publish}/`, colors.FgGreen)}
`);
	return buildStats;
}

cli();
