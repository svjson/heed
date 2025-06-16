import { exec } from 'child_process';
import { promisify } from 'util';

export const execAsync = promisify(exec);

/**
 * Check if a command is available on the system's PATH.
 *
 * This function tries to execute the command with an optional no-op flag.
 *
 * @param {string} command - The command to check.
 * @param {string} noOpCmd - An optional no-op command to append to the check.
 *
 * @return {Promise<boolean>} - Returns true if the command is found, false otherwise.
 */
export const isOnPath = async (command, noOpCmd) => {
  try {
    const cmd = process.platform === 'win32' ? `where ${command}` : `which ${command}`;
    await execAsync(noOpCmd ? [cmd, noOpCmd].join(' ') : cmd);
    return true;
  } catch {
    return false;
  }
}
