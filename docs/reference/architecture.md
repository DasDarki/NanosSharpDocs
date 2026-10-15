---
sidebar_position: 3
---

# Architecture

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

## Native layer

`NanosSharp.sh` preloads `libnanossharp.so` into the server. The library resolves the symbols it needs from the server
binary, validates the engine types it relies on and installs a few inline hooks. If anything does not match the
expected server version, NanosSharp disables itself and the server keeps running without it.

nanos world implements its scripting API once in an engine-agnostic way, Lua is only one consumer of it. NanosSharp is a
second consumer: it calls the same functions, properties and events as Lua, with the same arguments and results.

## Packages

Each C# package is a regular nanos world package. It gets its own scripting environment from nanos world and its own
collectible `AssemblyLoadContext` in .NET. Unloading a package unloads its assemblies, which makes hot reload possible.

## Generated API

The typed API is generated from a dump of the native API and the official API definitions. Native signatures decide
types and availability, the API definitions provide names, documentation, events and enums. Classes nanos world does not
document are described by supplements in the NanosSharp repository.
