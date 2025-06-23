import { createWriteStream, createReadStream } from 'fs';
import { mkdtemp } from 'fs/promises';
import os from 'os';
import path from 'path';
import { pipeline } from 'stream/promises';

import followRedirects from 'follow-redirects';
import unzipper from 'unzipper';
const { https, http } = followRedirects;

/**
 * Download a file from a given URL to a specified destination path.
 * This function supports both HTTP and HTTPS protocols.
 *
 * @param {string} url - The URL to download the file from.
 * @param {string} destPath - The local path where the file should be saved.
 *
 * @return {Promise<void>} - A promise that resolves when the download is complete.
 */
export const downloadFile = async (url, destPath) => {
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    const req = protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode} ${res.statusMessage}`));
        return;
      }

      const fileStream = createWriteStream(destPath);
      pipeline(res, fileStream)
        .then(resolve)
        .catch(reject);
    });

    req.on('error', reject);
  });
};

/**
 * Unzip a ZIP file to a specified target folder.
 * If the target folder is not provided, a temporary folder will be created.
 *
 * @param {string} zipPath - The path to the ZIP file to unzip.
 * @param {string} [targetFolder] - The folder where the contents should be extracted.
 *
 * @return {Promise<string>} - A promise that resolves to the path of the target folder.
 */
export const unzipTo = async (zipPath, targetFolder) => {
  targetFolder = targetFolder ?? await mkdtemp(path.join(os.tmpdir(), 'heed-plugin-unzip-'));

  await createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: targetFolder }))
    .promise();

  return targetFolder;
};
