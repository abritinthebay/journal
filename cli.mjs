#!/usr/bin/env node
import { spawn } from "child_process";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yargs from "yargs/yargs";

import journal from "./index.mjs";
import { color, colors, dim } from "./src/colors.mjs";

const { log } = console;
const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJSON = JSON.parse(readFileSync(path.resolve(dirname, "./package.json")));


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
	config.inputPath = path.resolve("./", config.inputPath || args.input);
	config.static = path.resolve("./", config.static || args.static);
	config.publish = path.resolve("./", config.publish || args.output);
	return config;
}

/*
 * The CLI commands
 */

function command(argv){
	log(titleTemplate);
	return getConfig(argv);
}

async function build(argv){
	const config = command(argv);
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

function staticServer(argv){
	const config = command(argv);
	log("Starting local static html server.");
	spawn("npx", ["http-server", config.publish, "-gbo", "-c10"], { stdio: "inherit" });
}

/* eslint-disable-next-line no-unused-vars */
const args = yargs(process.argv.slice(2)) // We have to have a var or node exits
	.scriptName("journal")
	.version(packageJSON.version)
	.usage("Usage: $0 [command] [args]")
	.help("h")
	.alias("h", "help")
	.alias("v", "version")
	.example("$0", "Basic usage, uses defaults")
	.example("$0 --config myconfig.json", "Use a custom config file")
	.example("$0 -i '../custom/dir'", "Use a custom content directory")
	.example("$0 view", "Start a server for built content")
	.example("$0 view --config myconfig.json", "Start server with a custom config")
	.group(["c"], "Journal Config: (can be overriden)")
	.default("c", "journal.json", `${dim("<current dir>")}/journal.json`)
	.alias("c", "config")
	.group(["i", "o", "s"], "Journal Directories: (overrides config)")
	.default("i", "content", `${dim("<current dir>")}/content/`)
	.alias("i", "input")
	.alias("i", "content")
	.describe("i", "Location of markdown to be parsed")
	.default("o", "build", `${dim("<current dir>")}/build/`)
	.alias("o", "output")
	.describe("o", "Location to output generated html")
	.default("s", "static", `${dim("<current dir>")}/static/`)
	.alias("s", "static")
	.describe("s", "Location of static files (css, images, etc)")
	.group(["v", "h"], "Other:")
	.command(["build", "$0"], "build a journal", {}, build)
	.command(["serve", "view"], "start a httpserver locally to serve any content", {}, staticServer)
	.epilog(`Documentation available at: https://github.com/abritinthebay/journal/

${dim(`© 2013–${new Date().getFullYear()} Gregory Wild-Smith`)}`)
	.argv;
