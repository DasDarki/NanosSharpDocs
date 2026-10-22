---
sidebar_position: 4
---

# Security

This page describes what NanosSharp protects, from whom, and where the boundaries are. For the components it refers to
see [Architecture](architecture.md).

## Who is trusted

NanosSharp runs code from two sources with very different trust:

- **Server packages** are chosen and installed by the server operator, exactly like Lua packages. They are trusted and
  run in process with full rights. Protecting the operator from their own packages is a non-goal, as it is for Lua.
- **Client packages** are different. The server pushes a package's client code to every player who joins, and that code
  runs on the player's machine. The player did not choose it and cannot vet it, so a malicious or compromised server
  could otherwise ship client code that reads the player's files, opens connections or runs native code.

The entire client security model exists for that second case: **untrusted client code must not get ambient access to
the player's machine.**

## Why the earlier model was not a boundary

Client C# used to run in process, the same as the server, with a compile-time IL allow list meant to restrict it. That
was never a real boundary. It was checked at compile time against a list, which reflection, `unsafe`, dynamic loading
and ordinary gaps all defeat, and once the assembly was loaded in process it had the full rights of the game regardless
of what its IL looked like. An allow list on code that then runs with full ambient authority is a lint, not a sandbox.

## The boundary today

Client packages run inside a WebAssembly sandbox (Wasmtime). The guarantees come from the sandbox, not from inspecting
the code:

- **Memory isolation.** The package runs in the reactor's own linear memory. It cannot read or write the host process,
  the engine or other packages' host-side state. It holds engine objects only as opaque integer handles that mean
  nothing without the trusted host's tables.
- **No ambient authority.** The reactor is handed no capability it is not given explicitly. It has no file system
  access beyond the single directory the host stages its assemblies into, no network, no process creation, no
  environment, no native calls and no foreign function interface.
- **The compiler stays outside.** Roslyn and NuGet run in the trusted host, never in the sandbox. The sandbox has no
  compiler, no dependency resolver and no way to fetch or emit native code.
- **One brokered door.** The only way out is the `nanos` import seam. Every import is implemented by the trusted host,
  which reads the arguments out of guest memory, validates and translates them, and calls the engine on the guest's
  behalf. There is no second channel.

A client package that tries to open a file, make an HTTP request, start a process or call a native library has no API
to do so and no ambient capability to fall back on. The farthest it can reach is the engine, through the one door.

## What the sandbox does and does not restrict

The sandbox restricts **ambient authority**, not **API use**. Inside it a package can still call any engine function
the client API exposes, because that is what a package is for, exactly like a Lua client package. The sandbox
guarantees the package cannot step outside that API to touch the machine; it does not decide whether a given engine
call is allowed. Engine-level behaviour (spawning entities, chat, reading game state the client already has) is a
game-design and rate-limiting concern for the package and server authors, the same as for Lua, not a job of the
isolation layer.

## Release integrity

Isolation only matters if the player runs the real NanosSharp. Releases are signed with an ECDSA key whose public half
is built into the installer and the updater. Every release ships a signed `SHA256SUMS`; the installer and the
self-updater verify every download, manual or automatic, against the pinned public key and reject anything that is not
a genuine, untampered release. A hijacked download, mirror or man-in-the-middle cannot slip in a different build. The
server and client update only to newer, verified releases and keep the previous version as a backup, and updates can be
turned off. The private signing key is never in the repository or in CI logs.

## Residual risks

- **The engine API is the remaining attack surface.** The sandbox contains the machine, not the engine; a hostile
  client package can still misuse the client API within the game, the same exposure Lua client packages have.
- **Packages share one reactor.** For the session there is a single reactor; packages are separated inside it by
  collectible load contexts and per-package scopes, which is logical isolation rather than a separate sandbox per
  package. Per-package isolation is possible future work.
- **The trusted host compiles untrusted source.** Roslyn compiling the downloaded client source is part of the trusted
  computing base by deliberate choice.
- **Interpreter, for now.** The reactor runs on the Mono interpreter. That is a performance characteristic, not a
  security one; an ahead-of-time reactor is a follow-up.

## Reporting

Please report security issues privately to the maintainer rather than through public issues.
