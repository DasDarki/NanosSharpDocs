---
sidebar_position: 1
---

# Installation

NanosSharp is installed into an existing nanos world server directory on Linux x64. Every release on
[GitHub](https://github.com/DasDarki/NanosSharp/releases) contains a bundle with the native library, the managed runtime
and a launcher, and an installer that sets everything up.

## Install with the installer

Run the installer in the server directory, next to `NanosWorldServer.sh`:

```bash
cd /path/to/nanos-world-server
curl -fsSLo nanossharp-install https://github.com/DasDarki/NanosSharp/releases/latest/download/nanossharp-install-linux-x64
chmod +x nanossharp-install
./nanossharp-install server
```

The installer downloads the latest release, checks it against the published checksums and extracts it into the server.
When the .NET 10 runtime is missing, it offers to install it for the current user into `~/.dotnet`, no root needed.

Run it again to update NanosSharp. `--uninstall` removes NanosSharp and keeps `NanosSharp.toml` and the NuGet cache,
`--yes` answers every question with its default for scripts, and `--help` lists every option.

## Install by hand

### 1. Install the .NET runtime

NanosSharp needs the .NET 10 runtime on the server. On Ubuntu:

```bash
sudo apt install dotnet-runtime-10.0
```

Other distributions are covered by the [.NET install guide](https://learn.microsoft.com/dotnet/core/install/linux).
If .NET is installed in a custom location, point `DOTNET_ROOT` to it. A runtime in `~/.dotnet` is found without it.

### 2. Extract the bundle into the server

```bash
cd /path/to/nanos-world-server
curl -L https://github.com/DasDarki/NanosSharp/releases/latest/download/nanossharp-<version>-linux-x64.tar.gz | tar -xz
```

This adds two things next to `NanosWorldServer.sh`:

```
NanosSharp.sh          launcher that loads NanosSharp into the server
NanosSharp/runtime/    native library and the managed runtime
```

## Start the server with the launcher

```bash
./NanosSharp.sh
```

`NanosSharp.sh` takes the same arguments as `NanosWorldServer.sh`. A successful start logs:

```
[NanosSharp] .NET 10.0.x runtime started.
```

On the first start NanosSharp creates `NanosSharp.toml` in the server directory, see
[Configuration](../reference/configuration.md).

## Updating

Run the installer again, or extract the bundle of the new version over the old one. Make sure the NanosSharp release
supports your server version, NanosSharp checks the server binary on start and disables itself with a clear message if
something does not match.

Prefer containers? Use the [Docker image](docker.md), it ships the server, .NET and NanosSharp together.
