# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev (all apps in parallel)
pnpm start

# Dev (individual)
pnpm start:shell        # port 3000
pnpm start:chat         # port 4201
pnpm start:contacts     # port 4202

# Build
pnpm build              # all
pnpm build:shell / build:chat / build:contacts

# Code quality
pnpm lint
pnpm test
pnpm typecheck

# Nx affected (CI-friendly, only changed projects)
pnpm affected:lint
pnpm affected:test
pnpm affected:build

# Project graph
pnpm graph
```

## Architecture

**Nx monorepo** with three Module Federation apps. All MFEs must run simultaneously for the full experience; shell dynamically imports the remote apps at runtime.

### Apps

| App | Framework | Port | Role |
|-----|-----------|------|------|
| `apps/shell` | Next.js 16 | 3000 | Host — consumes both remotes |
| `apps/mfe-chat` | React 19 + Rspack | 4201 | Remote — exposes `./Module` |
| `apps/mfe-contacts` | Angular 21 + Webpack | 4202 | Remote — exposes `./Routes` |

### Module Federation wiring

- Shell's `next.config.js` registers remotes pointing to `localhost:4201/remoteEntry.js` and `localhost:4202/remoteEntry.js` in dev.
- React and React-DOM are shared **singletons** (`eager: true`, no `requiredVersion`).
- mfe-chat entry: `apps/mfe-chat/src/remote-entry.ts` → exported as `./Module`.
- mfe-contacts entry: `apps/mfe-contacts/src/app/remote-entry/entry.routes.ts` → exported as `./Routes` (Angular lazy routes).

### Key config files

- `nx.json` — caching, default targets, Nx plugins
- `tsconfig.base.json` — shared path aliases
- `eslint.config.mjs` — workspace-wide ESLint (Nx module boundary rules apply)
- `.prettierrc` — `singleQuote: true`

## Tech stack

- **Package manager**: pnpm (lockfile v9)
- **Node**: 24.14.1 (`.nvmrc`)
- **Bundlers**: Rspack (mfe-chat), Webpack (mfe-contacts), Next.js built-in (shell)
- **Styling**: Tailwind CSS 3 + SCSS + PostCSS; Mantine UI (React), Angular Material (Angular)
- **Icons**: Tabler Icons React
