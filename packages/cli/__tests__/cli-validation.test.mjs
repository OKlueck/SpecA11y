import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(__dirname, '../dist/index.js');

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf8',
  });
}

test('invalid WCAG levels fail fast with accepted values', () => {
  const result = runCli(['https://example.com', '--level', 'B']);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /level/i);
  assert.match(result.stderr, /A, AA, AAA/);
});

test('invalid output formats fail fast with accepted values', () => {
  const result = runCli(['https://example.com', '--format', 'xml']);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /format/i);
  assert.match(result.stderr, /text, json, sarif/);
});

test('invalid LLM providers fail fast with accepted values', () => {
  const result = runCli(['https://example.com', '--semantic', '--llm-provider', 'localai']);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /llm-provider/i);
  assert.match(result.stderr, /anthropic, openai, ollama/);
  assert.doesNotMatch(result.stderr, /Running semantic analysis/);
});

test('existing non-check CLI invocations still work', () => {
  const result = runCli(['--version']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /\d+\.\d+\.\d+/);
});
