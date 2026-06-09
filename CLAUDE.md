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

## Shared hooks (`libs/hooks`)

### Rule: cross-app hooks go in `libs/hooks`, not inside any app

If a hook is pure React (no Next.js-specific APIs like `cookies()`, `headers()`, server actions) and could be useful in both `apps/shell` and `apps/mfe-chat`, write it in `libs/hooks/src/` and export it from `libs/hooks/src/index.ts`.

Import via the `@shared/hooks` alias (registered in `tsconfig.base.json`):

```ts
import { useStableState } from '@shared/hooks';
```

This alias resolves for both Next.js (via `withNx` reading tsconfig paths) and Rspack (via `NxAppRspackPlugin` reading tsconfig paths). No extra bundler config needed.

### Decision guide

| Hook uses… | Where to put it |
|---|---|
| Pure React (`useReducer`, `useRef`, `useState`, etc.) | `libs/hooks/src/` |
| Next.js server APIs (`cookies`, `headers`, `cache`) | `apps/shell/src/hooks/` or `apps/shell/src/lib/server/` |
| Angular-only | `apps/mfe-contacts/` |

### `useStableState`

**Use `useStableState` instead of multiple `useState` calls** when managing a group of related state fields. It merges partial updates and skips re-renders when values are shallow-equal — identical to `setState` in class components.

```ts
import { useStableState } from '@shared/hooks';

const [state, setState] = useStableState({
  error: null as string | null,
  loading: false,
});

setState({ loading: true });                         // partial update
setState(prev => ({ count: prev.count + 1 }));      // functional update
```

**When to use it:**
- Form pages with a loading flag + error message (e.g. login, register)
- Any component that would otherwise need 2+ related `useState` calls
- Replace `useAsyncAction` when you also need the mutation hook (e.g. react-query `useMutation`) — use `useStableState` for UI status and the mutation for data/cache

**Do not use it** for a single boolean or string — plain `useState` is cleaner there.

### File naming

All files in `libs/hooks/src/` and in `apps/shell` or `apps/mfe-chat` use **camelCase**: `useStableState.ts`, `useCurrentUser.ts`. Not kebab-case.

## Frontend coding guide

**Before writing any frontend code, read the guides in `docs/fe-guide/`:**

- [`docs/fe-guide/README.md`](docs/fe-guide/README.md) — quick rules index
- [`docs/fe-guide/file-naming.md`](docs/fe-guide/file-naming.md) — **camelCase for all React/Next.js files**, Next.js reserved-file exceptions
- [`docs/fe-guide/hooks.md`](docs/fe-guide/hooks.md) — hook inventory, useStableState, useAsyncAction rules — read before any state or async work
- [`docs/fe-guide/react-nextjs.md`](docs/fe-guide/react-nextjs.md) — component anatomy, header/body/footer split, hooks, Next.js server vs client
- [`docs/fe-guide/angular.md`](docs/fe-guide/angular.md) — Angular component template, signals, template rules
- [`docs/fe-guide/split-rules.md`](docs/fe-guide/split-rules.md) — when/how to split files, scoping rule, size limits
