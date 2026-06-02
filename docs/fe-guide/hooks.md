# Hooks Guide

**Before writing any new hook: check the inventory below first.**  
If an existing hook covers the need, use it. Do not duplicate.

---

## Hook inventory

| Hook | Location | Import | What it does |
|------|----------|--------|-------------|
| `useStableState` | `libs/hooks/src/` | `@shared/hooks` | Merges partial state updates, skips re-render on shallow-equal values. **Replaces multiple `useState` calls.** |
| `useAsyncAction` | `apps/shell/src/hooks/` | `../hooks/use-async-action` | Loading + error state for one async action. **Use for every API call.** |
| `useFormState` | `apps/shell/src/hooks/` | `../hooks/use-form-state` | Per-field form state with a typed `setField(key, value)` updater. |
| `useAppState` | `apps/mfe-chat/src/app/hooks/` | `./hooks/useAppState` | Global navigation state (active view, selected conversation, active tab). |
| `useChatSocket` | `apps/mfe-chat/src/app/hooks/` | `./hooks/useChatSocket` | WebSocket connect, send, typing indicators, unread counts. |
| `useIsMobile` | `apps/mfe-chat/src/app/hooks/` | `./hooks/useIsMobile` | Returns `true` when viewport < 768 px. |

> **Note:** `apps/mfe-chat/src/app/hooks/useStableState.ts` is a local copy — import from `@shared/hooks` instead and do not add new consumers of the local copy.

---

## Rule 1 — Check before writing

When you need a hook, follow this order:

1. Scan the inventory above.
2. Check `libs/hooks/src/index.ts` for anything added since this guide was written.
3. Check the `hooks/` folder of the app you're working in.
4. Only then write a new hook.

If a new hook would be useful in more than one app, put it in `libs/hooks/src/` and export it from `libs/hooks/src/index.ts`.

---

## Rule 2 — Replace `useState` pairs with `useStableState`

**Use `useStableState` whenever a component or hook needs ≥ 2 related state fields.**

```ts
// Bad — three separate useState calls for related state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<User | null>(null);

// Good — one call, partial updates, no extra re-renders
import { useStableState } from '@shared/hooks';

const [state, setState] = useStableState({
  isLoading: false,
  error: null as string | null,
  data: null as User | null,
});

setState({ isLoading: true });
setState({ isLoading: false, data: user });
setState(prev => ({ count: prev.count + 1 }));  // functional update
```

**When NOT to use it:**  
A single boolean, a single string, or a single value that changes independently — plain `useState` is cleaner there.

---

## Rule 3 — Use `useAsyncAction` for every API-loading function

Any function that calls an API, sends a socket message with a response, or performs any async operation that can fail must use `useAsyncAction`. Do not manage `isLoading` / `error` state manually.

```ts
// Bad — manual loading/error state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');

async function handleSubmit() {
  setIsLoading(true);
  setError('');
  try {
    await api.sendMessage(content);
  } catch {
    setError('Failed to send.');
  } finally {
    setIsLoading(false);
  }
}

// Good — useAsyncAction handles all of it
import { useAsyncAction } from '../hooks/use-async-action';

const { isLoading, error, execute } = useAsyncAction();

function handleSubmit() {
  execute(async () => {
    await api.sendMessage(content);
  });
}
```

Use `setError` from `useAsyncAction` when you need a custom error message:

```ts
const { isLoading, error, setError, execute } = useAsyncAction();

function handleLogin() {
  execute(async () => {
    const result = await api.login(email, password);
    if (result.status === 401) {
      setError('Wrong email or password.');
    }
  });
}
```

Render the error directly from the hook — do not copy it into other state:

```tsx
<button onClick={handleLogin} disabled={isLoading}>
  {isLoading ? 'Signing in…' : 'Sign in'}
</button>
{error && <p style={{ color: 'red' }}>{error}</p>}
```

---

## Rule 4 — `useAsyncAction` + `useStableState` together

When a component needs both async loading state AND additional UI state, use both hooks. Do not merge them into one `useStableState` call.

```ts
// A login form: useStableState owns the form fields, useAsyncAction owns loading/error
const [form, setForm] = useStableState({ email: '', password: '' });
const { isLoading, error, execute } = useAsyncAction();

function handleSubmit() {
  execute(async () => {
    await api.login(form.email, form.password);
  });
}
```

Do **not** put `isLoading` and `error` inside `useStableState` when `useAsyncAction` is available — that is what `useAsyncAction` is for.

---

## Rule 5 — Where to put a new hook

```
Is the hook pure React (useState / useEffect / useRef — no Next.js server APIs)?
  AND could it be useful in both apps/shell and apps/mfe-chat?
    YES → libs/hooks/src/   (export from index.ts, import via @shared/hooks)
    NO  → Is it Next.js-specific (cookies, headers, server actions)?
            YES → apps/shell/src/hooks/
            NO  → apps/mfe-chat/src/app/hooks/
```

One hook = one file = one concern. Do not put two unrelated hooks in the same file.

---

## Rule 6 — Hook file structure

```ts
// hooks/useRoomMessages.ts

// 1. Imports
import { useEffect } from 'react';
import { useStableState } from '@shared/hooks';
import { useAsyncAction } from './use-async-action';  // if async ops needed
import { api } from '../lib/api';

// 2. Types used only in this hook (no export unless consumed elsewhere)
interface RoomMessagesState {
  messages: Message[];
  hasMore: boolean;
}

// 3. Pure helper functions (no hooks, no side-effects)
function sortByTimestamp(msgs: Message[]): Message[] {
  return [...msgs].sort((a, b) => a.timestamp - b.timestamp);
}

// 4. The hook — one export per file
export function useRoomMessages(roomId: string) {
  // 4a. State
  const [state, setState] = useStableState<RoomMessagesState>({
    messages: [],
    hasMore: true,
  });

  // 4b. Async action (if needed)
  const { isLoading, error, execute } = useAsyncAction();

  // 4c. Effects — one job each
  useEffect(() => {
    execute(async () => {
      const raw = await api.getMessages(roomId);
      setState({ messages: sortByTimestamp(raw) });
    });
  }, [roomId]);

  // 4d. Named callbacks
  function loadMore() {
    execute(async () => {
      const more = await api.getMessages(roomId, { before: state.messages[0]?.id });
      setState(prev => ({ messages: [...sortByTimestamp(more), ...prev.messages] }));
    });
  }

  // 4e. Return only what callers need
  return { messages: state.messages, hasMore: state.hasMore, isLoading, error, loadMore };
}
```

---

## Anti-patterns — never do these

```ts
// 1. Multiple useState for related fields — use useStableState
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// 2. Manual try/catch/finally for loading state — use useAsyncAction
async function load() {
  setLoading(true);
  try { ... } finally { setLoading(false); }
}

// 3. Inline async in useEffect without useAsyncAction
useEffect(() => {
  (async () => {
    const data = await fetch('/api/rooms');  // loading state? error? nowhere to put it
  })();
}, []);

// 4. Returning anonymous functions from a hook
return {
  submit: () => execute(async () => { ... }),  // bad — new ref every render
};
// Use named functions inside the hook body instead.

// 5. Putting two unrelated concerns in one hook file
// hooks/useRoomAndTyping.ts  — bad, split into useRoomMessages + useTypingStatus
```
