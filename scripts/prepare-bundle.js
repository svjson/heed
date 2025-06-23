import {
  copyFileSync,
  cpSync,
  existsSync,
  rmSync
} from 'fs';
import path from 'path';

const slideViewerStaticDir = './slide-viewer-static';
const speakerStaticDir = './speaker-static';

const staticDir = './static';
const viewerStatic = path.join(staticDir, 'viewer');
const speakerStatic = path.join(staticDir, 'speaker');

import { Command } from 'commander';

const program = new Command();

program.name('prepare-bundle');

program
  .command('clean')
  .name('clean')
  .action(() => {
    if (existsSync(staticDir)) {
      rmSync(staticDir, { recursive: true });
    }
  });

program
  .command('copy-files')
  .name('copy-files')
  .action(() => {
    [
      { sourceRoot: slideViewerStaticDir, targetRoot: viewerStatic },
      { sourceRoot: speakerStaticDir, targetRoot: speakerStatic }
    ].forEach(webapp => {
      copyFileSync(
        path.join(webapp.sourceRoot, 'index.html'),
        path.join(webapp.targetRoot, 'index.html')
      );
      cpSync(
        path.join(webapp.sourceRoot, 'css'),
        path.join(webapp.targetRoot, 'css'),
        { recursive: true }
      );
    });

  });

program.parse();
