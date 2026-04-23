# Mail Workspace State Persistence Note

## Status

Short-term persistence is now implemented.

The mail workspace no longer loses its mailbox snapshot every time the user switches to another section of the dashboard.

## What changed

- `WorkspaceView.tsx` now keeps `MailWorkspace` mounted and toggles visibility instead of destroying the component tree.
- `MailWorkspace.tsx` now accepts an `isActive` flag.
- Mail refresh and polling run only while the workspace is active.
- Existing mailbox state remains in memory while the user visits other sections.

## Why this matters

This removes the old "blank inbox after tab switch" behavior and makes Mail feel like a persistent application surface instead of a disposable page.

## What this fix covers

- switching away from Mail and back
- preserving selected alias
- preserving selected message
- preserving active folder
- preserving the fetched snapshot inside the current dashboard session

## What this does not cover yet

- full browser reload persistence for all mailbox UI state
- IndexedDB or `sessionStorage` mailbox caching
- offline-first mailbox behavior
- multi-tab client cache coordination

## Backend support

The Rust mail backend already provides durable mailbox persistence through SQLite, so cold starts are also much better than before.

Relevant files:

- `apps/rust-mail-backend/src/state.rs`
- `apps/rust-mail-backend/src/storage.rs`
- `docs/Rust-Mail-Engine.md`

## Next best upgrade

If we need stronger persistence than the current mounted-workspace approach, the next upgrade should be a dedicated mailbox store in the admin app with selective browser persistence.
