#!/bin/node
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

import { Command, Option } from 'commander';

import {
  runCommand,

  addPlugin,
  addSlide,
  linkPlugin,
  newPresentation,
  pack,
  removePlugin,
  showIndex,
  showRoot
} from './lib/command/index.js';

const program = new Command();

program.hook('preAction', (_thisCommand, actionCommand) => {
  const opts = actionCommand.opts();
  opts.heedRoot = path.dirname(fileURLToPath(import.meta.url));
});

program
  .name('heed-cli')
  .description('Command-line tool for managing Heed presentations')
  .version('0.1.0');


/**
 * "add"-command and subcommands
 * 
 */
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

addCommand
  .command('plugin [pluginName] [source]')
  .description('Add a plugin to the presentation')
  .option('--json', 'Output result as JSON')
  .action(async (pluginName, source, options) => {
    await runCommand({
      cmd: addPlugin,
      cmdArgs: [
        { __type: 'root-required', value: '.' },
        { __type: 'string', __name: 'Plugin name', __required: true, value: pluginName },
        source
      ],
      cmdOpts: options
    })
  })

/**
 * "link"-command and subcommands
 * 
 */
const linkCommand = program.command('link');

linkCommand
  .command('plugin [pluginName] [source]')
  .description('Add a plugin by symlink from a local folder')
  .option('--json', 'Output result as JSON')
  .action(async (pluginName, source, options) => {
    await runCommand({
      cmd: linkPlugin,
      cmdArgs: [
        { __type: 'root-required', value: '.' },
        { __type: 'string', __name: 'Plugin name', __required: true, value: pluginName },
        source
      ],
      cmdOpts: options
    })
  })

/**
 * "new" command
 * 
 */

program
  .command('new [presentationName] [presentationPath]')
  .description('Create a new presentation in the current or provided folder.')
  .option('--json', 'Output index as JSON.')
  .action(async (presentationName, presentationPath = '.', options) => {
    await runCommand({
      cmd: newPresentation,
      cmdArgs: [
        { __type: 'string', __name: 'Presentation name', __required: true, value: presentationName},
        presentationPath
      ],
      cmdOpts: options
    });
  });

/**
 * "pack" command
 */
program
  .command('pack [presentationPath]')
  .description('Pack/compress the presentation into a distributable archive.')
  .option('--json', 'Output result as JSON.')
  .addOption(new Option('-t, --type [type]').choices(['zip', 'tar', 'tgz']).default('tgz'))
  .action(async (presentationPath=".", options) => {
    await runCommand({
      cmd: pack,
      cmdArgs: [
        { __type: 'root-required', value: presentationPath },
        options
      ]
    })
  });


/**
 * "remove"-command and subcommands
 * 
 */

const removeCommand = program.command('remove');

removeCommand
  .command('plugin [pluginName]')
  .description('Remove/uninstall a plugin from this presentation.')
  .option('--json', 'Output result as JSON.')
  .action(async (pluginName, options) => {
    await runCommand({
      cmd: removePlugin,
      cmdArgs: [
        { __type: 'root-required', value: '.' },
        { __type: 'string', __name: 'Plugin name', __required: true, value: pluginName }
      ],
      cmdOpts: options
    })
  });

/**
 * "show" command and subcommands
 * 
 */

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


/** Parse arguments and run command */
program.parse(process.argv);

