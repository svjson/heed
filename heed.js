#!/usr/bin/env node

/**
 * This script is the entry point for the Heed server, and acts as a process
 * launcher, or wrapper. This enables the Heed server to be restarted gracefully
 * by request of the server itself, without the need for external tools like
 * nodemon or pm2.
 *
 * It simply delegates all incoming arguments to the Heed server script,
 * making both heed and the user none the wiser.
 *
 * This is intended to be run from the command line, and will spawn a
 * Heed server process using the current Node.js executable.
 * It will also handle restarting the Heed server if it exits with code 86,
 * which is a custom exit code indicating that the server should be restarted.
 */
import { spawn } from 'child_process';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

/**
 * Custom exit code used to signal that the Heed server should be restarted.
 */
const RESTART_EXIT_CODE = 86;

/**
 * The root directory of the Heed project, derived from the current file's URL.
 * This is used to locate the Heed server script.
 */
const heedRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * The Node.js executable path, which will be used to spawn the Heed server.
 * In case it is launched by other means than `node` begin available on the
 * path, we are re-using `process.argv[0]` which usually contains the full
 * absolute path to the binary.
 */
const proc = process.argv[0];

/**
 * The argument list is built from the rest of `process.argv`, skipping `node`
 * and the element referring to this script, which we instead replace with
 * the Heed server script.
 */
const args = [path.join(heedRoot, 'heed-server.js'), ...process.argv.slice(2)];

/**
 * Variable holding te currently running Heed process, if any.
 */
let heedProcess = null;

/**
 * Flag indicating whether the Heed server has started successfully.
 *
 * This is used to determine if the server should be restarted
 * after a startup failure - if startup fails during restart following a
 * successful attempt, this means a faulty source change which we can
 * expect to recover from by retrying.
 */
let hasStartedSuccessfully = false;

/**
 * Spawn the Heed server and watch for process termination. As long as the Heed
 * Server exits with exit code `RESTART_EXIT_CODE` it means the server itself has
 * requested a restart, and we will keep re-launching it.
 */
const spawnHeed = () => {
  heedProcess = spawn(proc, args, {
    env: process.env,
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'inherit']
  });

  heedProcess.stdout.on('data', (out) => {
    const chunk = out.toString();
    process.stdout.write(chunk);
    if (chunk.includes('Listening on port')) {
      hasStartedSuccessfully = true;
    }
  });

  heedProcess.on('exit', (code) => {
    if (code === 1) {
      if (hasStartedSuccessfully) {
        console.log('[heed] Startup failure.');
        setTimeout(spawnHeed, 2000);
      }
    } else if (code !== RESTART_EXIT_CODE) {
      process.exit(code);
    } else {
      console.log('[heed] Restarting...');
      console.log('');
      spawnHeed();
    }
  });
};

/**
 * Start the Heed Server.
 */
spawnHeed();
