import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = new URL('./lint-typescript.mjs', import.meta.url).pathname;

async function withFixture(files, fn) {
  const dir = await mkdtemp(join(tmpdir(), 'speca11y-lint-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      const path = join(dir, name);
      await mkdir(join(path, '..'), { recursive: true });
      await writeFile(path, content);
    }
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe('lint-typescript', () => {
  it('passes clean TypeScript sources', async () => {
    await withFixture({ 'src/clean.ts': 'export const answer: number = 42;\n' }, (dir) => {
      const result = spawnSync(process.execPath, [script, 'src'], { cwd: dir, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stdout, /Lint passed/);
    });
  });

  it('fails on a representative lint violation', async () => {
    await withFixture({ 'src/bad.ts': 'export function bad() {\n  debugger;\n}\n' }, (dir) => {
      const result = spawnSync(process.execPath, [script, 'src'], { cwd: dir, encoding: 'utf8' });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /no-debugger/);
      assert.match(result.stderr, /src\/bad\.ts:2:3/);
    });
  });
});
