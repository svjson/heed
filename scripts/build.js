import { build } from 'vite';

await build({
  build: {
    rollupOptions: {
      input: './slide-viewer.bundle.input.js',
      output: {
        entryFileNames: 'heed.slide-viewer.bundle.js',
        dir: 'static/viewer/js'
      }
    },
    emptyOutDir: false
  }
});

await build({
  build: {
    rollupOptions: {
      input: './speaker-notes.bundle.input.js',
      output: {
        entryFileNames: 'heed.speaker-notes.bundle.js',
        dir: 'static/speaker/js'
      }
    },
    emptyOutDir: false
  }
});
