---
sidebar_position: 3
---

# Client setup

The NanosSharp client runs C# [client packages](../guides/client.md) in the game. Players only need it for servers that
use client packages, everything else in nanos world keeps working as before.

:::info Not part of the releases yet
The client is not published in the releases yet. Until it is, build it from source with `xmake client`, see
[Building from source](../contributing/building.md#game-client).
:::

## Install

Copy the content of the client build into the folder of the game executable:

```
nanos-world/NanosWorld/Binaries/Win64/
├── NanosWorld-Win64-Shipping.exe
├── version.dll            loads NanosSharp into the game
└── NanosSharp/            the .NET runtime and the NanosSharp client
```

The client brings its own .NET runtime, nothing has to be installed on the system.

## Linux and Steam Deck

nanos world runs through Proton. Wine loads its own `version.dll` unless told otherwise, so add this to the launch
options of nanos world in Steam:

```
WINEDLLOVERRIDES="version=n,b" PROTON_DISABLE_NVAPI=1 %command%
```

`PROTON_DISABLE_NVAPI=1` is only needed on AMD and Intel graphics. Without it the game can crash after a while when you
switch away from the window. This is a problem of the game with NVIDIA Reflex on these graphics cards and also happens
without NanosSharp.

## Check that it works

The client writes its log to `NanosWorld/Binaries/Win64/NanosSharp/nanossharp.log`. After joining a server with C#
client packages it contains a line like:

```
INFO  [my-gamemode] C# package started with 1 entry point(s).
```

On servers without NanosSharp the client stays idle and logs why it did not start a package.

## Uninstall

Delete `version.dll` and the `NanosSharp` folder from `NanosWorld/Binaries/Win64`.
