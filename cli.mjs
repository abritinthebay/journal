#!/usr/bin/env node
import { readFileSync } from "fs";
import path from "path";
import yargs from "yargs/yargs";

import journal from "./index.mjs";

const packageJSON = JSON.parse(readFileSync("./package.json"));

const yarg = yargs(process.argv.slice(2))
	.scriptName("journal")
	.version(packageJSON.version)
	.usage("Usage: $0 <command> [args]")
	.help("h")
	.alias("h", "help")
	.alias("v", "version")
	.command("build", "try and build a journal from the current directory.")
	.example("$0 build --config myconfig.js", "Build with a custom config file")
	.default("c", "journal.json")
	.alias("c", "config")
	.default("i", "content")
	.alias("i", "input")
	.default("o", "build")
	.alias("o", "output")
	.default("s", "static")
	.alias("s", "static")
	.epilog("");

function getConfig(args){
	const config = JSON.parse(readFileSync(path.resolve(args.config)));
	config.inputPath = path.resolve(config.inputPath || args.input);
	config.static = path.resolve(config.static || args.static);
	config.publish = path.resolve(config.publish || args.output);
	return config;
}

const args = yarg.argv;
const config = getConfig(args);

journal(config);
