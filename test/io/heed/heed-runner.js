
import { spawn } from 'child_process';
import path from 'path';

export const heedBin = async (args, { cwd, env={} } = {}) => {
  return new Promise((resolve) => {
    const heedJs = path.resolve('heed.js');

    const proc = spawn(heedJs, args, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', chunk => { stdout += chunk; });
    proc.stderr.on('data', chunk => { stderr += chunk; });

    proc.on('close', code => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', error => {
      resolve({ code: -1, stdout, stderr, error });
    });
  });
};

