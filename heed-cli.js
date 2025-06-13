#!/bin/node
import { Command } from 'commander';
import path from 'path';
import process from 'process';
import fs from 'fs';

import { findRoot } from './lib/presentation.js'
import { showIndex } from './lib/command/show-index.js';
import { showRoot } from './lib/command/show-root.js';

const program = new Command();

const runPresentationPathCommand = async (presentationRoot, command, opts) => {
  const presentationFile = path.join(presentationRoot, 'presentation.json');
  if (!fs.existsSync(presentationFile)) {
    const [_, relative] = await findRoot(presentationRoot);
    if (!relative) {
      console.error(`No presentation.json found in '${presentationRoot}' or any of its parent directories.`);
      process.exit(1);
    }
    presentationRoot = relative;
  }
  await command(presentationRoot, presentationFile, opts);
}

program
  .name('heed-cli')
  .description('Command-line tool for managing Heed presentations')
  .version('0.1.0');

const showCommand = program.command('show');

showCommand
  .command('index [presentationPath]')
  .description('Display a table of slides defined in presentation.json')
  .option('--json', 'Output index as JSON.')
  .action(async (presentationPath = '.', options) => {
    await runPresentationPathCommand(presentationPath, showIndex, { json: options.json })
  });

showCommand
  .command('root [dir]')
  .description('Display the root directory path of the presentation.')
  .option('--json', 'Output paths as JSON.')
  .action(async (dir = '.', options) => {
    await showRoot(dir, options);
  })

program.parse(process.argv);

