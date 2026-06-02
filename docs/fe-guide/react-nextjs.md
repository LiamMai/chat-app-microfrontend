# React / Next.js Component Guide

Applies to: `apps/mfe-chat` (React 19 + Rspack) and `apps/shell` (Next.js 16).

---

## File layout per feature

```
components/
  chatHeader/
    chatHeader.tsx        ← UI only, no hooks, no data fetching
    chatHeader.types.ts   ← prop interfaces (omit if trivial, inline instead)
  chatBody/
    chatBody.tsx
    messageItem.tsx       ← sub-component extracted when > ~40 lines
  chatFooter/
    chatFooter.tsx
hooks/
  useChatRoom.ts          ← state + effects for the whole room view
  useTypingStatus.ts      ← one hook = one concern
```

Use a subfolder only when a section has ≥ 2 files. A single-file section stays flat:
`components/Avatar.tsx` — no subfolder needed.

---

## Component anatomy

Every component follows this exact top-to-bottom order. Do not rearrange.

```tsx
// 1. Imports
import { useState, useRef } from 'react';
import type { ChatHeaderProps } from './chatHeader.types';

// 2. Local pure helpers (no side-effects, no hooks)
function buildTitle(name: string, isOnline: boolean): string {
  return isOnline ? name : `${name} · offline`;
}

// 3. Named event handlers OUTSIDE the component when they need no closure
// (move inside only when they close over props/state)

// 4. Component export — one per file
export function ChatHeader({ conversation, onBack, isMobile }: ChatHeaderProps) {
  // 4a. Hooks first
  const [menuOpen, setMenuOpen] = useState(false);

  // 4b. Derived values (no hooks, just calculations)
  const title = buildTitle(conversation.name, conversation.isOnline);

  // 4c. Named event handlers (never inline arrow on JSX props)
  function handleBackClick() {
    setMenuOpen(false);
    onBack();
  }

  function handleMenuToggle() {
    setMenuOpen((v) => !v);
  }

  // 4d. Return — split into named regions with comments
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header top bar */}
      <div>{title}</div>

      {/* Actions */}
      <div>
        <button onClick={handleBackClick}>Back</button>
        <button onClick={handleMenuToggle}>Menu</button>
      </div>
    </div>
  );
}

// 5. Private sub-components used only in this file — below the export
function TopBarIcon({ icon }: { icon: React.ReactNode }) {
  return <button>{icon}</button>;
}
```

---

## Header / Body / Footer split

For any screen that has a distinct top bar, scrollable content, and input bar — always three separate components.

```
ChatView (orchestrator — owns no styling, only layout wiring)
├── ChatHeader     ← top bar only: avatar, name, status, action buttons
├── ChatBody       ← scrollable messages list only
│   └── MessageItem  ← single message bubble
└── ChatFooter     ← input bar only: text field, send button, emoji button
```

`ChatView` (the parent) owns:
- The flex column wrapper
- Passing props down
- Calling hooks that span multiple sections (e.g. `useChatRoom`)

`ChatView` does **not** contain any inline styles for header/body/footer — those live in their own files.

---

## Hooks

```ts
// hooks/useChatRoom.ts
export function useChatRoom(roomId: string) {
  // 1. External data (react-query, socket)
  const { data: messages } = useMessagesQuery(roomId);

  // 2. Local state
  const [inputValue, setInputValue] = useState('');

  // 3. Refs
  const scrollRef = useRef<HTMLDivElement>(null);

  // 4. Effects — each effect has one job
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages?.length]);

  // 5. Named callbacks — never return anonymous functions
  function handleInputChange(value: string) {
    setInputValue(value);
  }

  function handleSubmit() {
    if (!inputValue.trim()) return;
    // ...
  }

  // 6. Return only what callers need
  return { messages, inputValue, scrollRef, handleInputChange, handleSubmit };
}
```

Rule: a hook that is only used in one component stays in `hooks/` next to that component's folder. Cross-app hooks go in `libs/hooks/src/` (see CLAUDE.md).

---

## Data layer (`lib/`)

```
lib/
  api.ts        ← raw fetch calls, no React
  queries.ts    ← react-query hooks (useQuery / useMutation wrappers)
  adapters.ts   ← raw API type → UI type transformations
  types.ts      ← shared TypeScript interfaces
  socket.ts     ← WebSocket singleton, no React
```

Components import from `queries.ts` and `adapters.ts`, never directly from `api.ts` or `socket.ts`.

---

## Next.js shell specifics (`apps/shell`)

- Server Components are the default. Add `'use client'` only when the component needs `useState`, `useEffect`, event handlers, or browser APIs.
- Layout-level wrappers (`layout.tsx`) stay server components.
- Client islands: create a separate `*Client.tsx` file rather than marking the whole layout client.

```
app/
  layout.tsx                ← server component, never 'use client'
  page.tsx                  ← server component by default
  components/
    AppSidebar.tsx           ← server if possible
    AppSidebarClient.tsx     ← 'use client' — only the interactive slice
```

---

## Debug checklist

When a component behaves unexpectedly:

1. Check hook dependencies in `useEffect` — missing dep = stale closure.
2. Check that event handlers are **named functions**, not recreated lambdas — use `useCallback` if passed as props to memoized children.
3. Check derived values are computed inside the component, not cached in module scope.
4. Use React DevTools "Highlight updates" to confirm only the intended subtree re-renders.
5. For socket/async bugs: add a `console.log` with a unique prefix at the source (`[socket]`, `[query]`) before diffusing into component tree.
