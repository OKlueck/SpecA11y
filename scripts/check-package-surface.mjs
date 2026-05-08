#!/usr/bin/env node
import { access, readFile, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const packageDir = resolve(process.argv[2] ?? '.');
const packageJsonPath = resolve(packageDir, 'package.json');
const pkg = JSON.parse(await readFile(packageJsonPath, 'utf8'));
const missing = [];

async function assertFile(label, packagePath) {
  if (typeof packagePath !== 'string' || !packagePath.startsWith('.')) return;
  const filePath = resolve(packageDir, packagePath);
  try {
    await access(filePath, constants.R_OK);
  } catch {
    missing.push(`${label}: ${packagePath}`);
  }
}

function collectExportPaths(exportsField, prefix = 'exports') {
  const paths = [];
  if (typeof exportsField === 'string') {
    paths.push([prefix, exportsField]);
  } else if (exportsField && typeof exportsField === 'object') {
    for (const [key, value] of Object.entries(exportsField)) {
      paths.push(...collectExportPaths(value, `${prefix}.${key}`));
    }
  }
  return paths;
}

for (const field of ['main', 'module', 'types']) {
  await assertFile(field, pkg[field]);
}
for (const [label, packagePath] of collectExportPaths(pkg.exports)) {
  await assertFile(label, packagePath);
}

const binEntries = typeof pkg.bin === 'string'
  ? [[pkg.name ?? 'bin', pkg.bin]]
  : Object.entries(pkg.bin ?? {});

for (const [name, packagePath] of binEntries) {
  await assertFile(`bin.${name}`, packagePath);
  if (typeof packagePath === 'string' && packagePath.startsWith('.')) {
    const filePath = resolve(packageDir, packagePath);
    try {
      const mode = (await stat(filePath)).mode;
      if ((mode & 0o111) === 0) missing.push(`bin.${name} not executable: ${packagePath}`);
    } catch {
      // Already reported by assertFile.
    }
  }
}

if (missing.length > 0) {
  console.error(`Package surface check failed for ${pkg.name ?? packageDir}:`);
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Package surface check passed for ${pkg.name ?? packageDir}`);
