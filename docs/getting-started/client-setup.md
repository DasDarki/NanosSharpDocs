---
sidebar_position: 3
---

# Client setup

The NanosSharp client runs C# [client packages](../guides/client.md) in the game. Players only need it for servers that
use client packages, everything else in nanos world keeps working as before.

## Install with the installer

The installer finds nanos world through Steam, downloads the latest client, checks it against the published checksums
and puts it next to the game. Close nanos world before running it.

**Windows:** download
[`nanossharp-install-win-x64.exe`](https://github.com/DasDarki/NanosSharp/releases/latest/download/nanossharp-install-win-x64.exe)
and run it.

**Linux and Steam Deck:**

```bash
curl -fsSLo nanossharp-install https://github.com/DasDarki/NanosSharp/releases/latest/download/nanossharp-install-linux-x64
chmod +x nanossharp-install
./nanossharp-install client
```

On Linux the installer also tells Proton to load NanosSharp, so no launch options are needed. nanos world has to be
started once before, because Proton creates its settings on the first start.

Run the installer again to update the client. `--uninstall` removes it, `--path` points it to a nanos world folder Steam
does not know about, and `--help` lists every option.

## Install by hand

Download `nanossharp-client-<version>-win-x64.zip` from the [releases](https://github.com/DasDarki/NanosSharp/releases)
and extract it into the folder of the game executable:

```
nanos-world/NanosWorld/Binaries/Win64/
├── NanosWorld-Win64-Shipping.exe
├── version.dll            loads NanosSharp into the game
└── NanosSharp/            the .NET runtime and the NanosSharp client
```

The client brings its own .NET runtime, nothing has to be installed on the system.

On Linux, Wine loads its own `version.dll` unless told otherwise. Add this to the launch options of nanos world in Steam:

```
WINEDLLOVERRIDES="version=n,b" %command%
```

## Automatic updates

The client keeps itself up to date. On game start it checks for a newer signed release in the background, downloads and
verifies it, and applies it the next time the game starts. You stay compatible with servers without reinstalling.

Updates are only applied when they are newer, and only when their signature matches the key built into the client, so a
tampered or forged download is rejected. To turn automatic updates off, add this to the launch options of nanos world:

```
NANOSSHARP_NO_UPDATE=1 %command%
```

## Check that it works

The client writes its log to `NanosWorld/Binaries/Win64/NanosSharp/nanossharp.log`. After joining a server with C#
client packages it contains a line like:

```
INFO  [my-gamemode] C# package started with 1 entry point(s).
```

On servers without NanosSharp the client stays idle and logs why it did not start a package.

## Uninstall

Run `nanossharp-install client --uninstall`, or delete `version.dll` and the `NanosSharp` folder from
`NanosWorld/Binaries/Win64` and remove the launch options again.
