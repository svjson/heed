#!/usr/bin/env node
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { Command, InvalidOptionArgumentError } from 'commander';

import { preparePresentation } from './server/prepare.js';
import { startServer } from './server/server.js';

/**
 * Locate the root of the heedjs package
 */
const heedRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load the Heed package.json
 */
const pkg = JSON.parse(await readFile(path.join(heedRoot, 'package.json')));

/**
 * Parse and validate the port number program option
 */
const parsePort = (value) => {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new InvalidOptionArgumentError(
      'Port must be an integer between 1 and 65535',
    );
  }

  return port;
};

/**
 * Root Commander-command
 */
const program = new Command();

/**
 * Commander-command for starting the Heed Server.
 */
program
  .name('heed')
  .description('Serve a Heed presentation over HTTP.')
  .version(pkg.version)
  .argument('[path]', 'Path to presentation directory or archive', '.')
  .option(
    '-p, --port <number>',
    'HTTP port to serve presentation on',
    parsePort,
    4000,
  )
  .option('-n, --no-watch', 'Disable file watching/auto-reload.', true)
  .option('-w, --show-watches', 'Display components under watch.', false)
  .option('-s, --silent-ws', 'Disable websocket logging', false)
  .action(async (pathArg, options) => {
    try {
      const { presentationRoot, presentationName, archiveFile } =
        await preparePresentation(pathArg, heedRoot);

      const serverOpts = {
        port: options.port,
        watch: options.watch,
        presentationName,
        presentationRoot,
        archiveFile,
        heedRoot,
        pkg,
        silentWs: options.silentWs,
        showWatches: options.showWatches,
      };

      await startServer(serverOpts);
    } catch (e) {
      console.error(`Failed to start Heed: ${e.message}`);
      if (e.suggestion) {
        console.error(e.suggestion);
      }
      console.log('');
      process.exit(1);
    }
  });

/**
 * Display Heed version and start the server.
 */
const bannerString = ` Heed v${pkg.version} - Slides as code `;
console.log('-'.repeat(bannerString.length));
console.log(bannerString);
console.log('-'.repeat(bannerString.length));
console.log('');
program.parse();
