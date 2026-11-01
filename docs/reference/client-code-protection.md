---
sidebar_position: 5
---

# Client code protection

This page describes how NanosSharp keeps a server's client-side C# from being copied, and where that protection ends.
It is the mirror image of [Security](security.md): that page protects the player from a hostile server, this page
protects the server operator's code from the players it runs on.

## The problem

Client code has to reach the client to run. A server pushes each package's client C# to every player who joins, and it
executes on their machine. Anyone connected can therefore look at whatever the client received. Historically that meant
the raw `.cs` source sat in the player's package folder, readable by anyone who opened it.

Perfect protection is impossible for the same reason: code that runs on a machine can always be recovered from that
machine with enough effort. The goal is not to make copying impossible, it is to raise the effort far enough that
casual copying stops being worthwhile, without ever putting a shared secret where a copier could find it.

## What is protected

Client-side C#, meaning the code in a package's `Client/` and `Shared/` folders. This is automatic. There is no flag to
turn on and no configuration to write; every server protects its client C# the same way.

Lua client code is **not** covered. A package's Lua still ships to the client as source, exactly as before.

## How it works

Four things happen between a package building on the server and its client code running on a player's machine.

### The client never receives source

The server compiles each package's `Client/` and `Shared/` C# into an assembly using its own compiler, and ships that
assembly rather than the source. The compiler and the dependency resolver stay on the server; the client carries
neither. A player therefore receives compiled IL, not readable C#.

### The assembly is sealed with a per-server key

Each server generates its own 256-bit key on first use and keeps it in its data directory. It never leaves the server
and is never built into any shipped file. Every client assembly the server sends is encrypted with that key, in transit
and in the client's on-disk cache.

The key reaches a client through an ephemeral key exchange (X25519): the client generates a throwaway key pair per
request and sends its public half, the server wraps its key to that public key, and the client unwraps it in memory.
Because nothing secret is embedded in any binary, reverse-engineering the NanosSharp client or the server yields only
code, never a key. To read one server's client code an attacker has to connect to that server and extract it there.
That is per-server effort and never a master key that unlocks every server at once.

### The decrypted assembly never touches disk

The client decrypts the assembly in its host process and hands the bytes straight to the WebAssembly sandbox from
memory. The plaintext assembly is never written to disk. What the cache holds is the still-encrypted blob, useless
without the server's key.

### String literals are encrypted

Before sealing, the server encrypts the string literals inside the assembly and injects a small routine that decrypts
them at runtime. A decompiled assembly no longer shows its strings in the clear. Type names, members and attributes are
deliberately left intact, because the runtime discovers a package's entry points, services, APIs and entity factories
by reflection and renaming them would break loading.

## The honest ceiling

This stops casual copying, roughly the person who opens the package folder to read or lift the code. It does not stop a
determined reverse engineer. Someone who connects to a server can still recover that server's client code by dumping
memory or reimplementing the exchange, and the compiled C# logic and control flow stay readable once decrypted; only
the string literals are obfuscated. The effort is always scoped to a single server, and reverse-engineering the
binaries alone never produces a key.

If your client code encodes a secret that must never be seen (a private API key, a credential), do not ship it to the
client at all. Keep it on the server and expose only the result over [events](../guides/events.md) or a
[package API](../guides/package-apis.md). Client protection raises the bar against copying; it is not a vault.
