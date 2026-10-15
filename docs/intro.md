---
sidebar_position: 1
slug: /intro
---

# What is NanosSharp?

NanosSharp is a .NET runtime for [nanos world](https://nanos-world.com) dedicated servers. It lets you write server
packages in C# next to, or instead of, Lua.

```csharp
public sealed class Gamemode : Package
{
    protected override void OnStart() => Player.OnReady += player => player.SendMessage("Hello from C#!");
}
```

## Why C#?

- **Speed.** NanosSharp calls the engine directly instead of going through the Lua stack. Calls into nanos world are
  faster than from Lua, and code that runs in C# itself is many times faster. See [Performance](reference/performance.md).
- **A typed API.** The whole server API is generated from the server itself and the official API definitions, with
  types, C# properties, typed events and documentation in your IDE.
- **The .NET ecosystem.** Use any NuGet package, `async`/`await`, LINQ, records and the rest of modern C#.
- **Hot reload.** Save a file and the package rebuilds and reloads while the server keeps running.

## How it fits into nanos world

Every C# package is a regular nanos world package with its own `Package.toml`, its own scripting environment and its
own entry in `Server.GetPackages()`. C# and Lua packages run side by side and can share values through
[`Exports`](guides/lua-interop.md), exactly like Lua packages share them through `Package.Export`.

There are two kinds of C# packages:

| Kind | What you ship | Built by |
|---|---|---|
| Script package | `.cs` files in `Server/` | the server, with Roslyn |
| Assembly package | `.dll` files in `Server/` | you, with `dotnet build` |

## Requirements

- A nanos world dedicated server on **Linux x64**. Windows is not supported yet.
- The **.NET 10 runtime** on the server machine, or the [Docker image](getting-started/docker.md) which contains it.
- The **.NET 10 SDK** on your development machine for IDE support and assembly packages.

:::caution Early development
NanosSharp is young. The API can still change between minor versions.
:::
