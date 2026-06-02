# Frontend Coding Guide

**Claude: read all three files in this folder before writing any frontend code.**

| Guide | Applies to |
|-------|-----------|
| [file-naming.md](./file-naming.md) | **All React & Next.js files** — camelCase rules and Next.js exceptions |
| [hooks.md](./hooks.md) | All React apps — **read this before writing any hook or state** |
| [react-nextjs.md](./react-nextjs.md) | `apps/mfe-chat` (React 19) · `apps/shell` (Next.js 16) |
| [angular.md](./angular.md) | `apps/mfe-contacts` (Angular 21) |
| [split-rules.md](./split-rules.md) | All apps — when and how to split files |

## Quick rules (apply everywhere)

1. **One concern per file.** UI render, event logic, and data fetching never share a file unless the component is trivially small (< ~60 lines total).
2. **Don't touch code outside the task scope.** If a file is not named in the task, don't edit it.
3. **Named functions only** for event handlers — no inline arrow functions on JSX/template props.
4. **camelCase filenames** across all apps (`chatHeader.tsx`, `useRoomState.ts`, `addFriends.component.ts`).
