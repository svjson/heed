import fs from 'fs';
import path from 'path';
import process from 'process';

import { findRoot } from '../presentation.js';

export const runCommand = async (opts) => {
  const { cmd, cmdArgs = [], cmdOpts = {} } = opts;

  try {
    const preparedArgs = [];
    let root = null;

    for (const arg of cmdArgs) {
      if (arg?.__required && !arg.value) {
        throw new Error(`${arg.__name ?? 'Required argument'} not specified.`);
      }

      switch (arg?.__type) {
      case 'root-required':
        const resolvedRoot = (root = await resolveRoot(arg.value, root));
        preparedArgs.push(resolvedRoot);
        break;
      case 'presentation-file':
        preparedArgs.push(await resolvePresentationFile(arg.value, root));
        break;
      case 'context-dir':
        preparedArgs.push(await resolveContextPath(arg.value, root));
        break;
      default:
        if (arg?.__type) {
          preparedArgs.push(arg.value);
        } else {
          preparedArgs.push(arg);
        }
        break;
      }
    }

    preparedArgs.push(cmdOpts);
    const result = await cmd.apply(null, preparedArgs);

    if (result) {
      if (cmdOpts?.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result?.message ?? result);
        console.log('');
      }
    }
  } catch (e) {
    if (cmdOpts?.json) {
      console.log(JSON.stringify({ error: `${e.message}` }, null, 2));
    } else {
      console.error(`ERROR: ${e.message}`);
      console.error('');
    }
    process.exit(1);
  }
};

const resolveRoot = async (presentationRoot, knownRoot) => {
  if (knownRoot) return knownRoot;

  const presentationFile = path.join(presentationRoot, 'presentation.json');
  if (!fs.existsSync(presentationFile)) {
    const [_, relative] = await findRoot(presentationRoot);
    if (!relative) {
      throw new Error(
        `No presentation.json found in '${presentationRoot}' or any of its parent directories.`,
      );
    }
    presentationRoot = relative;
  }

  return presentationRoot;
};

const resolvePresentationFile = async (presentationRoot, knownRoot) => {
  if (!knownRoot) {
    knownRoot = await resolveRoot(presentationRoot ?? process.env.PWD);
  }
  const presentationFile = path.join(knownRoot, 'presentation.json');
  return presentationFile;
};

const resolveContextPath = async (contextPath, knownRoot) => {
  if (!knownRoot) {
    knownRoot = await resolveRoot(contextPath ?? process.env.PWD);
  }
  const absoluteRoot = path.resolve(knownRoot);
  const absoluteCtxPath = path.resolve(contextPath);

  if (!absoluteCtxPath.startsWith(absoluteRoot)) {
    throw new Error(
      `Path '${absoluteCtxPath}' is not part of presentation with root '${absoluteRoot}'.`,
    );
  }

  return absoluteCtxPath;
};
