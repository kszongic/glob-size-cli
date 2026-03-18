#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`
  glob-size - Show total file size matching glob patterns

  Usage:
    glob-size <pattern> [pattern2 ...] [options]

  Options:
    -h, --help       Show this help
    -v, --version    Show version
    --human, -H      Human-readable sizes (default)
    --bytes, -b      Show raw bytes
    --each, -e       Show size of each file
    --sort, -s       Sort files by size (with --each)
    --top <n>        Show only top N files (with --each)

  Examples:
    glob-size '*.js'
    glob-size 'src/**/*.ts' --each --sort
    glob-size '*.log' '*.tmp' --bytes
    glob-size 'node_modules/**/*' --top 10
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(require('./package.json').version);
  process.exit(0);
}

// Parse flags
const flags = {
  bytes: args.includes('--bytes') || args.includes('-b'),
  each: args.includes('--each') || args.includes('-e'),
  sort: args.includes('--sort') || args.includes('-s'),
  top: null,
};

const topIdx = args.indexOf('--top');
if (topIdx !== -1 && args[topIdx + 1]) {
  flags.top = parseInt(args[topIdx + 1], 10);
  flags.each = true;
}

// Extract patterns (non-flag args)
const patterns = args.filter((a, i) => {
  if (a.startsWith('-')) return false;
  if (i > 0 && args[i - 1] === '--top') return false;
  return true;
});

// Minimal glob implementation (supports *, **, ?)
function globToRegex(pattern) {
  let re = '';
  let i = 0;
  while (i < pattern.length) {
    const c = pattern[i];
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        if (pattern[i + 2] === '/' || pattern[i + 2] === '\\') {
          re += '(?:.+[\\\\/])?';
          i += 3;
        } else {
          re += '.*';
          i += 2;
        }
      } else {
        re += '[^\\\\/]*';
        i++;
      }
    } else if (c === '?') {
      re += '[^\\\\/]';
      i++;
    } else if ('.()[]{}+^$|\\'.includes(c)) {
      re += '\\' + c;
      i++;
    } else if (c === '/') {
      re += '[\\\\/]';
      i++;
    } else {
      re += c;
      i++;
    }
  }
  return new RegExp('^' + re + '$', 'i');
}

function walkDir(dir) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(walkDir(full));
      } else if (entry.isFile()) {
        results.push(full);
      }
    }
  } catch (e) {
    // skip permission errors
  }
  return results;
}

function humanSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, i);
  return (i === 0 ? val : val.toFixed(1)) + ' ' + units[i];
}

function formatSize(bytes) {
  return flags.bytes ? bytes + ' B' : humanSize(bytes);
}

// Determine base dir and build regex for each pattern
let allFiles = [];

for (const pattern of patterns) {
  // Find the static prefix (base directory)
  const parts = pattern.replace(/\\/g, '/').split('/');
  const baseParts = [];
  for (const p of parts) {
    if (p.includes('*') || p.includes('?') || p.includes('{')) break;
    baseParts.push(p);
  }
  const base = baseParts.length > 0 ? baseParts.join(path.sep) : '.';
  const regex = globToRegex(pattern.replace(/\\/g, '/'));

  let files;
  if (pattern.includes('*') || pattern.includes('?')) {
    files = walkDir(base || '.');
  } else {
    // Literal file
    files = [pattern];
  }

  for (const f of files) {
    const rel = path.relative('.', f).replace(/\\/g, '/');
    if (regex.test(rel)) {
      allFiles.push(f);
    }
  }
}

// Dedupe
allFiles = [...new Set(allFiles)];

// Get sizes
let entries = [];
let total = 0;

for (const f of allFiles) {
  try {
    const stat = fs.statSync(f);
    if (stat.isFile()) {
      entries.push({ file: f, size: stat.size });
      total += stat.size;
    }
  } catch (e) {
    // skip
  }
}

if (entries.length === 0) {
  console.log('No files matched.');
  process.exit(0);
}

if (flags.each) {
  if (flags.sort) {
    entries.sort((a, b) => b.size - a.size);
  }
  if (flags.top) {
    entries = entries.slice(0, flags.top);
  }
  const maxLen = Math.max(...entries.map(e => formatSize(e.size).length));
  for (const e of entries) {
    const s = formatSize(e.size);
    console.log(`  ${s.padStart(maxLen)}  ${path.relative('.', e.file)}`);
  }
  console.log();
}

console.log(`  ${entries.length} file${entries.length === 1 ? '' : 's'}  ${formatSize(total)}`);
