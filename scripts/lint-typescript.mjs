#!/usr/bin/env node
import ts from 'typescript';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const roots = process.argv.slice(2);
const targets = roots.length > 0 ? roots : ['src'];
const cwd = process.cwd();
const failures = [];
const checked = [];

function walk(path) {
  let stat;
  try {
    stat = statSync(path);
  } catch {
    return;
  }

  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (entry === 'dist' || entry === 'node_modules' || entry === '.turbo') continue;
      walk(join(path, entry));
    }
    return;
  }

  if (!/\.[cm]?tsx?$/.test(path) || /\.d\.ts$/.test(path)) return;
  lintFile(path);
}

function formatLocation(sourceFile, position) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);
  return `${relative(cwd, sourceFile.fileName)}:${line + 1}:${character + 1}`;
}

function addFailure(sourceFile, node, rule, message) {
  failures.push(`${formatLocation(sourceFile, node.getStart(sourceFile))} ${rule} ${message}`);
}

function lintFile(path) {
  const text = readFileSync(path, 'utf8');
  const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  checked.push(path);

  for (const diagnostic of sourceFile.parseDiagnostics) {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    failures.push(`${formatLocation(sourceFile, diagnostic.start ?? 0)} syntax ${message}`);
  }

  function visit(node) {
    if (node.kind === ts.SyntaxKind.DebuggerStatement) {
      addFailure(sourceFile, node, 'no-debugger', 'debugger statements must not be committed');
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

for (const target of targets) {
  walk(join(cwd, target));
}

if (checked.length === 0) {
  console.error(`No TypeScript files found under ${targets.join(', ')}`);
  process.exit(1);
}

if (failures.length > 0) {
  console.error('TypeScript lint failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Lint passed for ${checked.length} TypeScript file${checked.length === 1 ? '' : 's'}.`);
