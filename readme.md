# glob-size-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/glob-size-cli.svg)](https://www.npmjs.com/package/@kszongic/glob-size-cli)
[![npm downloads](https://img.shields.io/npm/dm/@kszongic/glob-size-cli.svg)](https://www.npmjs.com/package/@kszongic/glob-size-cli)
[![license](https://img.shields.io/npm/l/@kszongic/glob-size-cli.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/@kszongic/glob-size-cli.svg)](https://nodejs.org)
![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-blue)

Show total file size matching glob patterns from the command line. **Zero dependencies.** Works on Windows, macOS, and Linux.

> Ever wondered where all your disk space went? One glob and you'll know.

## Why?

You're debugging a bloated Docker image. Or your CI cache is 2 GB and you have no idea why. Or you just want to know how big `src/` actually is without dragging files into a GUI.

`du` doesn't understand globs. `find -exec stat` is a mouthful. On Windows, forget about it.

**glob-size-cli** gives you one command:

```bash
npx @kszongic/glob-size-cli 'node_modules/**/*.js' --top 5
```

Done. Largest JS files in node_modules, sorted, human-readable.

## Install

```bash
npm install -g @kszongic/glob-size-cli
```

Or run directly without installing:

```bash
npx @kszongic/glob-size-cli '*.json'
```

## Usage

```bash
# Total size of all JS files
glob-size '*.js'

# Recursive with per-file breakdown
glob-size 'src/**/*.ts' --each --sort

# Multiple patterns
glob-size '*.log' '*.tmp' --bytes

# Top 10 largest files in node_modules
glob-size 'node_modules/**/*' --top 10
```

## Options

| Flag | Description |
|------|-------------|
| `-h, --help` | Show help |
| `-v, --version` | Show version |
| `-H, --human` | Human-readable sizes (default) |
| `-b, --bytes` | Show raw byte counts |
| `-e, --each` | Show size of each matched file |
| `-s, --sort` | Sort files by size (largest first) |
| `--top <n>` | Show only top N files |

## Examples

```
$ glob-size '*.json' --each --sort
  603 B  package.json
  292 B  tsconfig.json

  2 files  895 B
```

## Recipes

### Find the biggest offenders in node_modules

```bash
glob-size 'node_modules/**/*' --top 20 --sort
# Instantly see which packages are eating your disk
```

### Audit build output size

```bash
glob-size 'dist/**/*.js' --each --sort
# Check before deploying — catch bloat early
```

### Track asset sizes in CI

```bash
# In GitHub Actions or any CI:
TOTAL=$(glob-size 'build/**/*' --bytes | tail -1 | awk '{print $NF}')
if [ "$TOTAL" -gt 5000000 ]; then
  echo "::warning::Build exceeds 5 MB ($TOTAL bytes)"
fi
```

### Compare file types in a project

```bash
echo "TypeScript:" && glob-size 'src/**/*.ts'
echo "CSS:"        && glob-size 'src/**/*.css'
echo "Images:"     && glob-size 'src/**/*.{png,jpg,svg}'
# Quick breakdown of where the weight is
```

### Clean up log/temp files

```bash
# See how much space logs are using before deleting
glob-size '**/*.log' '**/*.tmp' --each --sort
```

### Pair with dep-size for full picture

```bash
# How big is a dependency on npm?
npx dep-size axios

# How much space does it take on YOUR disk?
glob-size 'node_modules/axios/**/*'
```

## Use Cases

- **Docker optimization** — find what's inflating your image layers
- **CI/CD pipelines** — gate deployments on build size thresholds
- **Monorepo auditing** — compare package sizes across workspaces
- **Disk cleanup** — find large log/temp/cache files before deleting
- **Bundle analysis** — quick check before reaching for webpack-bundle-analyzer

## How It Works

1. Expands glob patterns using Node's built-in `fs` (no `glob` dependency)
2. Calls `fs.statSync` on each matched file
3. Sums and formats the results

No shell piping, no child processes, no external binaries. Pure Node.js.

## Comparison

| Tool | Zero deps | Cross-platform | Glob support | Per-file breakdown | Top N | Install |
|------|-----------|---------------|-------------|-------------------|-------|---------|
| **glob-size-cli** | ✅ | ✅ Win/Mac/Linux | ✅ Native | ✅ `--each` | ✅ `--top` | `npx @kszongic/glob-size-cli` |
| `du -sh` | N/A | ❌ Unix only | ❌ Directories only | ❌ | ❌ | Built-in (Unix) |
| `find + stat` | N/A | ❌ Unix only | ❌ Manual | ✅ Manual | ❌ | Built-in (Unix) |
| [dirsize](https://www.npmjs.com/package/dirsize) | ❌ | ✅ | ❌ Directories only | ✅ | ❌ | `npx dirsize` |
| PowerShell | N/A | ❌ Windows only | ✅ | ✅ | Manual | Built-in (Win) |

## Related

- [dep-size](https://github.com/kszongic/dep-size) — Check npm package install size before adding it
- [bar-chart-cli](https://github.com/kszongic/bar-chart-cli) — Visualize the numbers in your terminal
- [file-tree-cli](https://github.com/kszongic/file-tree-cli) — Print directory trees
- [kill-port-cli](https://github.com/kszongic/kill-port-cli) — Kill processes by port
- [env-lint-cli](https://github.com/kszongic/env-lint-cli) — Lint .env files

## License

MIT © kszongic
