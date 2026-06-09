# Angular Component Guide

Applies to: `apps/mfe-contacts` (Angular 21, standalone components).

---

## File layout per feature

Each feature lives in its own folder with exactly these four files:

```
remote-entry/
  add-friends/
    addFriends.component.ts    ← class logic only (signals, methods)
    addFriends.component.html  ← template only
    addFriends.component.scss  ← styles only
    addFriends.types.ts        ← interfaces/types (omit if trivial, put inline in .ts)
```

Naming: camelCase folder and file names. No kebab-case.

---

## Component class anatomy

Every component class follows this exact order:

```ts
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 3rd-party and local imports follow

// 1. Interfaces / types used only in this file
export interface FriendItem {
  id: number;
  name: string;
  isOnline: boolean;
  requestSent: boolean;
}

// 2. Component decorator
@Component({
  selector: 'app-add-friends',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addFriends.component.html',
  styleUrls: ['./addFriends.component.scss'],
})
export class AddFriendsComponent {
  // 3. Injected services
  private readonly router = inject(Router);

  // 4. Signals — state that the template reads
  searchQuery = signal('');
  users = signal<FriendItem[]>([]);

  // 5. Computed signals — derived, never mutated directly
  filteredUsers = computed(() =>
    this.users().filter((u) =>
      u.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    )
  );

  // 6. Lifecycle hooks
  ngOnInit(): void {
    // one job per lifecycle hook
  }

  // 7. Event handlers — one method per user action, named after the action
  onSearch(value: string): void {
    this.searchQuery.set(value);
  }

  onToggleRequest(userId: number): void {
    this.users.update((list) =>
      list.map((u) => (u.id === userId ? { ...u, requestSent: !u.requestSent } : u))
    );
  }

  onClearSearch(): void {
    this.searchQuery.set('');
  }

  // 8. Getters — read-only derived values for template convenience
  get hasResults(): boolean {
    return this.filteredUsers().length > 0;
  }

  // 9. Constants exposed to template
  readonly ROUTES = ROUTES;
}
```

---

## Template anatomy

Split large templates into named regions with comments. Angular has no JSX sub-components inside a file — use `<ng-container>` blocks with clear comment markers instead.

```html
<!-- ── Header ─────────────────────────────────────────── -->
<div class="header">
  <button (click)="onBack()">Back</button>
  <h2>Add Friends</h2>
</div>

<!-- ── Search bar ────────────────────────────────────── -->
<div class="search-bar">
  <input
    type="text"
    [ngModel]="searchQuery()"
    (ngModelChange)="onSearch($event)"
    placeholder="Search people..."
  />
  <button *ngIf="searchQuery()" (click)="onClearSearch()">Clear</button>
</div>

<!-- ── Body: user list ───────────────────────────────── -->
<div class="user-list">
  <ng-container *ngFor="let user of filteredUsers()">
    <div class="user-card">
      <span>{{ user.name }}</span>
      <button (click)="onToggleRequest(user.id)">
        {{ user.requestSent ? 'Cancel' : 'Add' }}
      </button>
    </div>
  </ng-container>
</div>

<!-- ── Footer: navigation ────────────────────────────── -->
<div class="footer-nav">
  <a [routerLink]="ROUTES.CONTACTS">Back to contacts</a>
</div>
```

Rules:
- Event bindings always call **a method on the class** — never inline expressions like `(click)="users.set([])"`.
- `*ngFor` tracks by `item.id` when list items have an `id` field: `*ngFor="let u of users(); trackBy: trackById"`.
- Avoid logic in templates: `{{ user.name | titlecase }}` is fine; `{{ getUserFullName(user) }}` is a method call that runs on every change detection — use a `computed()` signal instead.

---

## Header / Body / Footer split

For screens large enough to warrant it, extract sub-components:

```
remote-entry/
  contacts/
    contacts.component.ts         ← orchestrator, owns no styling
    contacts.component.html
    contacts.component.scss
    contactsHeader/
      contactsHeader.component.ts
      contactsHeader.component.html
      contactsHeader.component.scss
    contactsList/
      contactsList.component.ts
      contactsList.component.html
      contactsList.component.scss
```

The parent component passes data via `@Input()` signals and receives actions via `@Output()` EventEmitters. It does not hold styling for child regions.

---

## Services and data layer (`lib/`)

```
lib/
  api.ts            ← raw HttpClient calls, returns Observable/Promise
  queries.ts        ← Angular Query (or signal-based wrappers) — one function per endpoint
  auth.interceptor.ts
```

Components inject services; they do not call `api.ts` directly.

```ts
// Good
private readonly contactsService = inject(ContactsService);

// Bad — component calls fetch directly
async loadContacts() {
  const res = await fetch('/api/contacts');
}
```

---

## Signals quick rules

| Situation | Use |
|-----------|-----|
| Mutable state the template reads | `signal()` |
| Derived value from one or more signals | `computed()` |
| Side-effect that runs when a signal changes | `effect()` |
| One-time async load | `ngOnInit` + signal, or Angular Query |

Never call `.set()` / `.update()` inside a `computed()` — computed is read-only.

---

## Debug checklist

1. Template not updating? Check if the value is a plain property instead of a `signal()` — Angular 21 change detection tracks signals, not raw fields.
2. `computed()` returning stale value? Verify all signals it reads are declared with `signal()`, not plain fields.
3. `*ngFor` causing full list re-render? Add `trackBy`.
4. HTTP call firing twice? Check `ngOnInit` vs constructor — do data fetching in `ngOnInit` only.
5. Injected service undefined? Confirm `providedIn: 'root'` or it's in the component's `providers` array.
