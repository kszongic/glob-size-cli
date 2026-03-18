# glob-size-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/glob-size-cli.svg)](https://www.npmjs.com/package/@kszongic/glob-size-cli)
[![license](https://img.shields.io/npm/l/@kszongic/glob-size-cli.svg)](./LICENSE)

> Show total file size matching glob patterns from the command line. Zero dependencies.

## Install

```bash
npm install -g @kszongic/glob-size-cli
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

## License

MIT © kszongic
