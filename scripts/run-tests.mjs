import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const directory = await mkdtemp(path.join(tmpdir(), 'gencompass-tests-'));
try {
  const output = path.join(directory, 'model.test.mjs');
  await build({
    entryPoints: ['tests/model.test.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: output,
    logLevel: 'warning',
  });
  const result = spawnSync(process.execPath, ['--test', output], {
    stdio: 'inherit',
  });
  process.exitCode = result.status ?? 1;
} finally {
  await rm(directory, { recursive: true, force: true });
}
