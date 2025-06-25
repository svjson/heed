import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

import { watch } from 'chokidar';

/**
 * Check if the Heed is running from sources by looking for
 * specific files that indicate the presence of the full source
 * repository.
 *
 * @param {string} heedRoot - The root directory of the Heed project.
 * @returns {Promise<boolean>} - Returns true if in development mode, false otherwise.
 */
const isHeedDevMode = (heedRoot) => {
  const sourceProjectIndicators = [
    path.join(heedRoot, 'package.json'),
    path.join(heedRoot, 'scripts/build.js'),
    path.join(heedRoot, 'slide-viewer-static')
  ];

  for (const path of sourceProjectIndicators) {
    if (!existsSync(path)) {
      return false;
    }
  }
  return true;
};

/**
 * Generic file watcher that triggers an action when disk contents change
 * under any of the supplied `paths`.
 *
 * The action is delayed by `delay` ms(default=1000) and resets to a coalesced
 * delay(default=500) if another change is detected during that period, to avoid
 * incessant restart-actions when multiple files are changed in quick succession.
 *
 * Optionally, the invoked action can receive an array of events that were queued
 * during the delay, which can help the target determine what to reload/re-initialize
 * if it wants to avoid a complete reboot.
 *
 * @param {Object} options - Options for the watcher.
 * @param {Array<string>} options.paths - Paths to watch for changes. Files or directories.
 * @param {number} [options.delay=1000] - Delay before triggering the action.
 * @param {number} [options.coalesceDelay=500] - Coalesced delay for subsequent changes.
 * @param {boolean} [options.queueEvents=false] - Whether to queue events and pass them to the action.
 * @param {Function} options.onTrigger - Function to call when a change is detected.
 */
const watchAndTrigger = ({
  paths,
  trimRoot,
  delay = 1000,
  coalesceDelay = 500,
  queueEvents = false,
  onTrigger
}) => {
  let timer = null;
  const eventQueue = [];

  const trigger = () => {
    const actualDelay = timer ? coalesceDelay : delay;
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const args = queueEvents ? [...eventQueue] : undefined;
        await onTrigger(args);
      } catch (_) {
        // Silent fail for now
      } finally {
        timer = null;
        eventQueue.length = 0;
      }
    }, actualDelay);
  };

  watch(paths, { ignoreInitial: true }).on('all', (eventName, filePath) => {
    if (queueEvents) {
      const reportPath = trimRoot && filePath.startsWith(trimRoot)
        ? filePath.substring(trimRoot.length).replace(/^\/+/, '')
        : filePath;
      eventQueue.push({ type: eventName, path: reportPath });
    }
    trigger();
  });
};

/**
 * Rebuild the static assets for a given webapp.
 *
 * Currently, `npm run build` rebuilds both the slide viewer and
 * speaker notes apps, but this will change in the future.
 *
 * @param {string} webapp - The name of the webapp to rebuild (e.g., 'slide-viewer').
 * @param {string} heedRoot - The root directory of the Heed project.
 * @return {Promise<void>} - A promise that resolves when the rebuild is complete.
 */
const rebuildStatic = async (webapp, heedRoot) => {
  return new Promise((resolve, reject) => {
    console.log(`[${webapp}] Rebuilding....`);
    const build = spawn('npm', ['run', 'build'], {
      cwd: heedRoot,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderr = '';
    build.stderr.on('data', chunk => {
      stderr += chunk;
    });

    build.on('exit', (code) => {
      if (code === 0) {
        console.log(`[${webapp}] Build completed.`);
        resolve();
      } else {
        let fileSectionReached = false;
        for (const line of stderr.split('\n')) {
          if (line.startsWith('file:')) {
            fileSectionReached = true;
          }
          if (fileSectionReached) {
            console.error(`[${webapp}] ${line}`);
          }
        }
        console.error(`[${webapp}] Build failed.`);
        reject();
      }
    });
  });
};

/**
 * Generates an onTrigger handler for rebuilding one of the static webapps,
 * according to the supplied options.
 *
 * @param {Object} opts - Options for the rebuild action.
 * @param {string} opts.webapp - The name of the webapp to rebuild (e.g., 'slide-viewer').
 * @param {string} opts.heedRoot - The root directory of the Heed project.
 * @param {string} opts.eventName - The name of the event to trigger after rebuild.
 * @param {Object} opts.wsServer - The WebSocket server to notify after rebuild.
 */
const onTriggerRebuildStatic = ({
  webapp,
  heedRoot,
  eventName,
  wsServer
}) => {
  return async () => {
    await rebuildStatic(webapp, heedRoot);
    wsServer.clients.forEach((client => {
      client.send(JSON.stringify({ event: eventName }));
    }));
  };
};

/**
 * This is the main entry point for the rest of the application, that sets up
 * watchers for the various parts.
 *
 * It tries to determine if heed is running from sources, in which case it registers
 * watchers for the webapps and heed itself.
 *
 * Unless Heed is serving a presentation from an archive file, which is considered to be
 * static in nature, a watcher is set up that notifies the slide-viewer and speaker-notes
 * apps that they may be interested in reloading the user content.
 *
 * @param {Object} opts - Options for initializing the watcher.
 * @param {boolean} opts.isArchive - Whether the presentation is served from an archive file.
 * @param {Function} opts.getWss - Function to get the WebSocket server instance.
 * @param {string} opts.heedRoot - The root directory of the Heed package.
 * @param {string} opts.presentationRoot - The root directory of the presentation files.
 * @return {Array<string>} - An array of watch identifiers for the registered watchers.
 */
export const initWatcher = (opts) => {
  const {
    isArchive,
    getWss,
    heedRoot,
    presentationName,
    presentationRoot
  } = opts;

  const watches = [];
  const wsServer = getWss();

  if (isHeedDevMode(heedRoot)) {

    /** Watch Slide Viewer Webapp */
    watchAndTrigger({
      paths: [
        path.join(heedRoot, 'slide-viewer-static'),
        path.join(heedRoot, 'slide-viewer.bundle.input.js')
      ],
      onTrigger: onTriggerRebuildStatic({
        webapp: 'slide-viewer',
        eventName: 'slide-viewer-updated',
        heedRoot,
        wsServer,
      })
    });
    watches.push('slide-viewer');

    /** Watch Speaker Notes Webapp */
    watchAndTrigger({
      paths: [
        path.join(heedRoot, 'speaker-static'),
        path.join(heedRoot, 'speaker-notes.bundle.input.js')
      ],
      onTrigger: onTriggerRebuildStatic({
        webapp: 'speaker-notes',
        eventName: 'speaker-notes-updated',
        heedRoot,
        wsServer
      })
    });
    watches.push('speaker-notes');

    /** Watch Heed server & lib */
    watchAndTrigger({
      paths: [
        path.join(heedRoot, 'lib'),
        path.join(heedRoot, 'server'),
        path.join(heedRoot, 'heed-server.js')
      ],
      onTrigger: () => process.exit(86)
    });
    watches.push('heed');
  }

  if (!isArchive) {
    /** Watch presentation sources */
    watchAndTrigger({
      paths: presentationRoot,
      trimRoot: presentationRoot,
      queueEvents: true,
      onTrigger: (eventQueue) => {
        console.log('[presentation] Presentation files updated...');
        wsServer.clients.forEach(client => {
          client.send(JSON.stringify({ event: 'presentation-updated', subjects: eventQueue }));
        });
      }
    });
    watches.push(`presentation("${presentationName}")`);
  }
  return watches;
};
