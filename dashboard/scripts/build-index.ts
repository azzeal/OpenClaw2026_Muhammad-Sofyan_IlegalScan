#!/usr/bin/env tsx
import fs from 'node:fs';
import { rebuildIndex } from '../lib/db';
import { paths } from '../lib/paths';

function once() {
  const stats = rebuildIndex();
  console.log(
    `[clearmark-index] built in ${stats.duration_ms}ms — patterns:${stats.patterns} journal:${stats.journal} projects:${stats.projects} → ${paths.indexDb}`,
  );
}

const watch = process.argv.includes('--watch');
once();

if (watch) {
  const watched = [paths.patterns, paths.journal, paths.projects];
  for (const w of watched) {
    if (!fs.existsSync(w)) continue;
    fs.watch(w, { recursive: true }, (event, file) => {
      console.log(`[clearmark-index] change detected: ${event} ${file ?? ''} — rebuilding`);
      try {
        once();
      } catch (err) {
        console.error('[clearmark-index] rebuild failed:', err);
      }
    });
  }
  console.log('[clearmark-index] watching for changes... (ctrl-c to stop)');
}
