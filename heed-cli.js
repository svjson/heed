#!/bin/node
import { Command } from 'commander';
import path from 'path';
import process from 'process';
import fs from 'fs';

import { showIndex } from './lib/command/show-index.js';

const program = new Command();

const runPresentationPathCommand = async (presentationRoot, command) => {
  const presentationFile = path.join(presentationRoot, 'presentation.json');
  if (!fs.existsSync(presentationFile)) {
    console.error('No presentation.json found in', presentationRoot);
    process.exit(1);
  }
  await command(presentationRoot, presentationFile);
}

program
  .name('heed-cli')
  .description('Command-line tool for managing Heed presentations')
  .version('0.1.0');

const showCommand = program.command('show');

showCommand
  .command('index [presentationPath]')
  .description('Display a table of slides defined in presentation.json')
  .action(async (presentationPath = '.') => {
    await runPresentationPathCommand(presentationPath, showIndex)
  });

program.parse(process.argv);

