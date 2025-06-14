#!/bin/node
import { Command } from 'commander';
import process from 'process';

import { findRoot } from './lib/presentation.js'
import { runCommand } from './lib/command/command-runner.js';

import { addSlide } from './lib/command/add-slide.js';
import { newPresentation } from './lib/command/new.js';
import { showIndex } from './lib/command/show-index.js';
import { showRoot } from './lib/command/show-root.js';

const program = new Command();

program
  .name('heed-cli')
  .description('Command-line tool for managing Heed presentations')
  .version('0.1.0');

const addCommand = program.command('add');

addCommand
  .command('slide [slideId] [path]')
  .description('Add a slide to the presentation.')
  .option('--json', 'Output result as JSON')
  .action(async (slideId, contextPath = '.', options) => {
    await runCommand({
      cmd: addSlide,
      cmdArgs: [
        { __type: 'root-required', value: contextPath },
        { __type: 'presentation-file' },
        { __type: 'string', __name: 'Slide ID', __required: true, value: slideId },
        { __type: 'context-dir', value: contextPath }
      ],
      cmdOpts: options
    })
  });

program
  .command('new [presentationName] [presentationPath]')
  .description('Create a new presentation in the current or provided folder')
  .option('--json', 'Output index as JSON.')
  .action(async (presentationName, presentationPath = '.', options) => {
    await runCommand({
      cmd: newPresentation,
      cmdArgs: [
        { __name: 'Presentation name', __type: 'string', __required: true, value: presentationName},
        presentationPath
      ],
      cmdOpts: options
    });
  });

const showCommand = program.command('show');

showCommand
  .command('index [presentationPath]')
  .description('Display a table of slides defined in presentation.json')
  .option('--json', 'Output index as JSON.')
  .action(async (presentationPath = '.', options) => {
    await runCommand({
      cmd: showIndex,
      cmdArgs: [
        { __type: 'root-required', value: presentationPath },
        { __type: 'presentation-file' }
      ],
      cmdOpts: options
    });
  });

showCommand
  .command('root [dir]')
  .description('Display the root directory path of the presentation.')
  .option('--json', 'Output paths as JSON.')
  .action(async (dir = '.', options) => {
    await runCommand({
      cmd: showRoot,
      cmdArgs: [dir],
      cmdOpts: options,
    });
  })

program.parse(process.argv);

