#!/usr/bin/env node
import { Command } from 'commander';
import { runFile } from "./cmds/runFile.js";
import { compileFile } from "./cmds/compileFile.js";

const program = new Command();

program
  .name('koltic')
  .description('Koltic command line interface tools')
  .version('0.1.0-notable');

// bikin flag -c atau --config
program
  .option('-r, --run <path>', 'running files with extensions .lt and .ltc')
  .option('-c, --compile <path>', 'compile .lt files to .ltc')
  .option('-p, --perform', 'monitor performance while running code or compiling code', false);

program.parse();

const options = program.opts();

if (options.run) {
  runFile(options.run, options.perform);
} else if (options.compile) {
  compileFile(options.compile, options.perform);
} else {
  console.log('No config provided');
}