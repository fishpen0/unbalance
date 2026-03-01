# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**unbalanced** is an [Unraid](https://unraid.net/) plugin that transfers files/folders between disks in an Unraid array. It supports two modes: **Scatter** (spread data from one disk to multiple disks) and **Gather** (consolidate data from a user share into a single disk). Transfers are performed using rsync at the disk level (under `/mnt/diskN/`, not `/mnt/user/`).

## Build Commands

### Full Release Build (for deployment to Unraid)
```sh
make release
```
Builds the React UI (`npm run build` in `ui/`), then cross-compiles Go for `linux/amd64`. The UI is embedded into the binary via `go:embed` in `ui/web.go`.

### Local Build (for current platform)
```sh
make local
```

### Frontend Only
```sh
cd ui && npm run build   # production build
cd ui && npm run dev     # dev server (see proxy note below)
cd ui && npm run lint    # ESLint
```

### Go Tests
```sh
go test -v ./...
```

## Development with Live UI

For UI development, add a proxy to `ui/vite.config.ts` pointing to your Unraid server, then run `npm run dev`. The UI will proxy `/api` requests to the actual Unraid server running the daemon.

```ts
server: {
  proxy: {
    "/api": { target: "http://<unraid-server>:7090" }
  }
}
```

The daemon listens on port **7090** by default.

## Architecture

### Backend (Go)

```
unbalance.go                      ← Entry point; CLI args via kong; sets up pubsub Hub
daemon/cmd/boot.go                ← Boot command that delegates to Orchestrator
daemon/services/orchestrator.go   ← Starts Core and Server, handles OS signals
daemon/services/core/             ← All business logic
  core.go                         ← Mailbox handler; subscribes to commands from pubsub
  scatter.go / gather.go          ← Scatter/Gather plan and transfer logic
  planner.go / operation.go       ← Planning and operation execution helpers
  array.go / helper.go            ← Unraid array state, rsync execution
daemon/services/server/server.go  ← Echo HTTP server; REST API + WebSocket handler
daemon/domain/                    ← All domain types (Config, State, Plan, Operation, etc.)
daemon/common/common.go           ← Constants: API endpoint, pubsub topic strings, op codes
daemon/algorithm/                 ← Greedy and knapsack bin-packing algorithms
daemon/lib/                       ← Shell execution helpers, env file utils
```

**Internal communication:** The `Core` and `Server` communicate via a [pubsub](https://github.com/cskr/pubsub) hub (`domain.Context.Hub`). The Server publishes commands received over WebSocket; the Core subscribes to those topics and publishes events back through `socket:broadcast`.

**WebSocket:** The server maintains a single WebSocket connection at `/ws`. The Core's long-running goroutines (scatter plan, gather move, etc.) publish progress events that get broadcast to the connected browser.

### Frontend (React/TypeScript)

```
ui/src/main.tsx          ← Router setup (react-router-dom v7)
ui/src/App.tsx           ← Root layout; fetches initial config/state on mount
ui/src/types.tsx         ← All shared types and enums (mirrors Go domain types)
ui/src/state/            ← Zustand stores
  unraid.tsx             ← Primary store; WebSocket connection; state machine for UI flow
  scatter.tsx            ← Scatter-specific selections
  gather.tsx             ← Gather-specific selections
  config.tsx             ← App config store
ui/src/flows/            ← Page-level components organized by feature
  scatter/               ← Scatter flow: select → plan → transfer/validation → transfer/operation
  gather/                ← Gather flow: select → plan → transfer/targets → transfer/operation
  history/               ← Operation history
  settings/              ← Settings pages (notifications, reserved space, flags, verbosity)
  logs/                  ← Log viewer
ui/src/shared/           ← Reusable components (tree, disk, transfer dashboard, etc.)
ui/src/helpers/          ← Utilities: routing, state machine, units, tree operations
ui/src/api/index.tsx     ← HTTP client for REST API calls
```

**State management:** Zustand with immer middleware. The `useUnraidStore` in `state/unraid.tsx` is the central store—it owns the WebSocket connection and a lightweight state machine (`helpers/sm.ts`) that drives navigation between flow steps.

**Topic mirror:** The pubsub topic strings in `daemon/common/common.go` are exactly mirrored in the `Topic` enum in `ui/src/types.tsx`. Commands flow `UI → WebSocket → Server → pubsub → Core`; events flow `Core → pubsub → Server → WebSocket → UI`.

### Key Runtime Paths (Unraid-specific)
- Plugin config: `/boot/config/plugins/unbalanced/`
- History file: `/boot/config/plugins/unbalanced/unbalanced.hist`
- Settings file: `/boot/config/plugins/unbalanced/unbalanced.env`
- Logs: `/var/log/unbalanced.log`
- Disk paths: `/mnt/disk1`, `/mnt/disk2`, etc.
- Mail/notify command: `/usr/local/emhttp/webGui/scripts/notify`
