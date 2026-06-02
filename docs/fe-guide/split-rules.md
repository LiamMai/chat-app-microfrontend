# When and How to Split Files

Applies to all apps in this monorepo.

---

## The core rule

**One concern = one file.**

A "concern" is exactly one of:
- UI structure and style (component template / JSX return)
- Event handling logic (what happens when the user does X)
- Data fetching / mutation (queries, mutations, socket)
- State derivation (computed values, adapters, selectors)
- Types / interfaces

When two concerns end up in the same file, split.

---

## Decision tree — should I split?

```
Is the file > 150 lines?
  YES → split (see "how to split" below)
  NO  → does it mix UI rendering with data fetching?
          YES → split
          NO  → does it mix event handler logic with JSX/template?
                  YES → consider extracting handlers to a hook / method class
                  NO  → fine to keep together
```

---

## How to split a React component

Before:
```
ChatView.tsx  (300 lines — header, messages, input, socket logic all mixed)
```

After:
```
chatView/
  chatView.tsx          ← orchestrator (~50 lines, layout only)
  chatHeader.tsx        ← top bar UI
  chatBody.tsx          ← messages list UI
  chatFooter.tsx        ← input bar UI
hooks/
  useChatRoom.ts        ← all state + socket + query logic
```

Orchestrator pattern:
```tsx
// chatView.tsx — owns layout, delegates everything else
export function ChatView({ roomId }: { roomId: string }) {
  const room = useChatRoom(roomId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ChatHeader conversation={room.conversation} onBack={room.handleBack} />
      <ChatBody messages={room.messages} scrollRef={room.scrollRef} />
      <ChatFooter
        value={room.inputValue}
        onChange={room.handleInputChange}
        onSubmit={room.handleSubmit}
        isPending={room.isPending}
      />
    </div>
  );
}
```

---

## How to split an Angular component

Before:
```
contacts.component.ts  (200 lines — signals, HTTP calls, template logic all together)
```

After:
```
contacts/
  contacts.component.ts     ← signals + event methods only
  contacts.component.html   ← template only
  contacts.component.scss   ← styles only
lib/
  contactsService.ts        ← HTTP calls, returns Observables
  queries.ts                ← Angular Query wrappers
```

---

## Scoping rule — don't touch what you don't own

When fixing or adding to a specific section (e.g. the message input bar):

1. Identify the **one file** that owns that section (`chatFooter.tsx`).
2. Edit only that file and its direct hook (`useChatRoom.ts` if the change needs state).
3. Do not touch sibling components (`chatHeader.tsx`, `chatBody.tsx`).
4. Do not touch parent orchestrators unless the props interface must change.

If a change requires editing more than 3 files, stop and re-examine — the component boundary is probably wrong.

---

## Naming conventions

| What | React/Next.js | Angular |
|------|--------------|---------|
| Component file | `chatHeader.tsx` | `chatHeader.component.ts` |
| Hook file | `useChatRoom.ts` | — |
| Service file | — | `contactsService.ts` |
| Type file | `chatHeader.types.ts` | `addFriends.types.ts` |
| Style file | `.module.scss` or inline | `chatHeader.component.scss` |
| Utility file | `navigate.ts` | `navigate.ts` |

All filenames: **camelCase**. No kebab-case anywhere in this monorepo.

---

## Props interface rules

- Define the interface in the same file if it has ≤ 5 fields.
- Extract to `*.types.ts` when it has > 5 fields or is shared by multiple components.
- Never use `any`. Use `unknown` + type guard or a specific type.
- Required props first, optional props last.

```ts
// Good
interface ChatHeaderProps {
  conversation: Conversation;   // required
  isMobile: boolean;            // required
  onBack: () => void;           // required
  className?: string;           // optional last
}

// Bad — mixing optional and required randomly, using any
interface ChatHeaderProps {
  onBack?: any;
  conversation: Conversation;
  className: string;
  isMobile?: boolean;
}
```

---

## Size limits (soft guidelines)

| File type | Soft limit | Action when exceeded |
|-----------|-----------|----------------------|
| React component | 150 lines | Extract sub-component or hook |
| Angular component class | 120 lines | Extract service or split sub-component |
| Angular template | 100 lines | Extract child component |
| Hook | 80 lines | Split into two focused hooks |
| `lib/api.ts` | 200 lines | Split by domain (`chatApi.ts`, `contactsApi.ts`) |
