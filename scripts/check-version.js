import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseRevision = process.argv[2] || '';
const headRevision = process.argv[3] || 'HEAD';
const shippedPath = /^(?:index\.html|styles\.css|js\/)/;
const semverIdentifier = '(?:0|[1-9]\\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)';
const semverPattern = new RegExp(`^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-(${semverIdentifier}(?:\\.${semverIdentifier})*))?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`);

function readPackage(revision) {
  const source = revision
    ? execFileSync('git', ['show', `${revision}:package.json`], { encoding: 'utf8' })
    : readFileSync('package.json', 'utf8');
  return JSON.parse(source);
}

function parseVersion(version, label) {
  if (typeof version !== 'string') {
    throw new Error(`${label} package.json version must be a string`);
  }
  const match = version.match(semverPattern);
  if (!match) {
    throw new Error(`${label} package.json version is not valid semver: ${version}`);
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split('.') : [],
  };
}

function compareIdentifiers(left, right) {
  const leftNumber = /^\d+$/.test(left);
  const rightNumber = /^\d+$/.test(right);
  if (leftNumber && rightNumber) return Number(left) - Number(right);
  if (leftNumber) return -1;
  if (rightNumber) return 1;
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareVersions(left, right) {
  for (const part of ['major', 'minor', 'patch']) {
    if (left[part] !== right[part]) return left[part] - right[part];
  }
  if (!left.prerelease.length && !right.prerelease.length) return 0;
  if (!left.prerelease.length) return 1;
  if (!right.prerelease.length) return -1;
  for (let index = 0; index < Math.max(left.prerelease.length, right.prerelease.length); index += 1) {
    if (index === left.prerelease.length) return -1;
    if (index === right.prerelease.length) return 1;
    const comparison = compareIdentifiers(left.prerelease[index], right.prerelease[index]);
    if (comparison) return comparison;
  }
  return 0;
}

function changedFiles() {
  if (!baseRevision || /^0+$/.test(baseRevision)) {
    return execFileSync('git', ['ls-tree', '-r', '--name-only', headRevision], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  }
  return execFileSync('git', ['diff', '--name-only', `${baseRevision}...${headRevision}`], { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);
}

try {
  const currentPackage = readPackage(headRevision === 'HEAD' ? '' : headRevision);
  const currentVersion = parseVersion(currentPackage.version, 'Current');
  const changedShippedFiles = changedFiles().filter(file => shippedPath.test(file));

  if (!baseRevision || /^0+$/.test(baseRevision)) {
    console.log(`Version ${currentPackage.version} is valid for the initial revision.`);
  } else if (changedShippedFiles.length) {
    const basePackage = readPackage(baseRevision);
    const baseVersion = parseVersion(basePackage.version, 'Base');
    if (compareVersions(currentVersion, baseVersion) <= 0) {
      throw new Error(`Shipped files changed (${changedShippedFiles.join(', ')}) but version ${currentPackage.version} is not higher than base version ${basePackage.version}`);
    }
    console.log(`Version changed from ${basePackage.version} to ${currentPackage.version} for shipped files.`);
  } else {
    console.log(`No shipped calculator files changed; version ${currentPackage.version} is valid.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
