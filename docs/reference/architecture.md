---
sidebar_position: 3
---

# Architecture

NanosSharp adds a .NET runtime to nanos world so packages can be written in C# on the dedicated server and in the game
client. The same design runs on both sides, with one difference: server packages are trusted and run in process, while
client packages are untrusted and run inside a WebAssembly sandbox. For the trust model see [Security](security.md).

## Server

```
NanosWorldServer
 └─ libnanossharp.so  (LD_PRELOAD, C++)
     ├─ hooks the scripting engine lifecycle, the server tick and package load and unload
     ├─ talks to the engine-agnostic reflection layer (IClass, IFunction, ScriptValue) instead of the Lua stack
     ├─ reads and writes Lua globals for Package.Export and turns C# functions into Lua closures
     └─ hosts CoreCLR through hostfxr
         └─ NanosSharp.Host (C#)
             ├─ loads every package with C# code into its own collectible AssemblyLoadContext
             ├─ compiles .cs files with Roslyn, loads .dll files directly
             ├─ restores NuGet packages of script packages
             └─ hot reloads packages when their sources change
```

## Client

```
NanosWorld-Win64-Shipping.exe
 └─ version.dll  (proxy of the system version.dll, C++)
     ├─ finds the scripting engine through MSVC RTTI and patches the engine vtables
     ├─ resolves the Lua C API by byte signatures for Lua interop
     └─ hosts a bundled CoreCLR through hostfxr
         └─ NanosSharp.Host (C#, client flavor)
             ├─ compiles Client/ and Shared/ of downloaded packages with Roslyn
             ├─ runs them in a WebAssembly sandbox, not in process
             └─ answers the server handshake and tells Lua fallbacks whether C# runs
```

## Native layer

`NanosSharp.sh` preloads `libnanossharp.so` into the server; on the client the game loads `version.dll` on start. Each
resolves the symbols it needs from the game binary, validates the engine types it relies on and installs a few inline
hooks. If anything does not match the expected game version, NanosSharp disables itself and the game keeps running
without it.

nanos world implements its scripting API once in an engine-agnostic way; Lua is only one consumer of it. NanosSharp is a
second consumer: it calls the same functions, properties and events as Lua, with the same arguments and results.

## The interop seam

All traffic between managed code and the engine crosses a single, explicit seam, so there is exactly one place that
leaves managed code:

- `NativeApi` carries the host-to-engine calls (create values, call functions, read properties, spawn entities, log).
  Managed code reaches the engine only through `NativeRuntime.Api`.
- `ManagedCallbacks` is the reverse direction the engine calls: tick, engine attach and detach, a subscribed function
  firing, an entity being created or destroyed.

Engine values and entities never cross as raw pointers that managed code dereferences. They cross as opaque handles and
a small blittable argument record, so the same seam works whether the managed side sits in the same process (server) or
behind a sandbox boundary (client).

## Packages

Each C# package is a regular nanos world package. It gets its own scripting environment from nanos world and its own
collectible `AssemblyLoadContext` in .NET. Unloading a package unloads its assemblies, which makes hot reload possible
on the server.

## Generated API

The typed API is generated per side from a dump of the native API and the official API definitions. Native signatures
decide types and availability, the API definitions provide names, documentation, events and enums. Classes nanos world
does not document are described by supplements in the NanosSharp repository.

## The client sandbox

Client packages are pushed by the server to every player, so they are untrusted. They are compiled with Roslyn on the
player's machine, outside the sandbox, and then run inside a WebAssembly sandbox with no ambient access to the machine.

```
 trusted host (CoreCLR, client flavor)
  ├─ compiles Client/ + Shared/ of a package with Roslyn
  ├─ stages the compiled assemblies into a directory the reactor reads
  ├─ embeds Wasmtime, implements the nanos imports, owns the handle tables
  └─ relays engine callbacks into the reactor
         │  (the nanos import / export boundary)
 reactor (Wasmtime, Mono interpreter)
  ├─ the slim in-sandbox runtime, no Roslyn, no NuGet
  ├─ loads staged package assemblies and runs their lifecycle
  └─ reaches the engine only by calling the brokered nanos imports
```

- The reactor is the slim client runtime published to `wasi-wasm` and relinked into a WASI reactor module, so the host
  can call its exports repeatedly after boot (boot, reconcile packages, tick, engine attached, invoke function, entity
  callbacks).
- Inside the reactor the `NativeApi` struct is backed by direct `nanos` wasm imports, so every call site in the API
  assembly stays the same. The trusted host implements each import: it reads arguments out of the guest's linear
  memory, translates the guest argument records to and from the native ones, resolves handles, calls the real engine
  function and writes the result back. Engine values, functions, properties, environments and entities live in handle
  tables on the trusted side and cross to the guest only as small integer indices.
- When a client package subscribes to an engine event, the subscribed function is a reactor export the trusted host
  calls when the engine fires it. Guest-owned function ids are tagged so the host can tell its own callbacks apart from
  the sandbox's and route each correctly.
- The host stages a package, boots the reactor once, and reconciles the loaded set against the staged set whenever it
  changes, loading, unloading and reloading packages without a reboot. It ticks the reactor once per frame.

Client packages therefore cannot use NuGet and have no hot reload. Everything else, reflection, dependency injection,
events, entity factories and async, works the same as on the server.
