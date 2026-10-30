---
sidebar_position: 1
---

# Installation

NanosSharp is installed into an existing nanos world server directory on Linux x64 or Windows x64. Every release on
[GitHub](https://github.com/DasDarki/NanosSharp/releases) contains a bundle with the native library, the managed runtime
and an installer that sets everything up. The Linux bundle ships a launcher and uses the system .NET runtime, the
Windows bundle is self-contained and loads automatically. The sections below cover Linux first; for Windows jump to
[Windows dedicated server](#windows-dedicated-server).

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

## Windows dedicated server

NanosSharp also runs on a Windows nanos world dedicated server. The Windows bundle is self-contained: it ships the
native proxy, the managed runtime and the .NET runtime, so there is no separate .NET install and no launcher script.

### Install with the installer

Run the installer in the server directory, next to `NanosWorldServer.exe`:

```powershell
cd C:\path\to\nanos-world-server
curl.exe -fsSLo nanossharp-install.exe https://github.com/DasDarki/NanosSharp/releases/latest/download/nanossharp-install-win-x64.exe
.\nanossharp-install.exe server
```

The installer downloads the latest release, checks it against the published checksums and extracts it into the server.
Run it again to update, and `.\nanossharp-install.exe server --uninstall` removes NanosSharp.

### Install by hand

Extract the Windows server bundle next to `NanosWorldServer.exe`:

```powershell
cd C:\path\to\nanos-world-server
curl.exe -L -o nanossharp-server.zip https://github.com/DasDarki/NanosSharp/releases/latest/download/nanossharp-server-<version>-win-x64.zip
Expand-Archive nanossharp-server.zip -DestinationPath . -Force
del nanossharp-server.zip
```

This adds `version.dll` and `NanosSharp\` (the managed runtime and a bundled .NET runtime) next to the server.

### Start the server

Start `NanosWorldServer.exe` as usual. `version.dll` loads NanosSharp automatically, so no launcher and no launch
options are needed. A successful start logs to `NanosSharp\nanossharp.log`:

```
[NanosSharp] .NET 10.0.x runtime started.
```

On the first start NanosSharp creates `NanosSharp.toml` next to the server, see
[Configuration](../reference/configuration.md). There is no launcher on Windows, so update by running the installer
again instead of through automatic updates.

## Updating

Run `./nanossharp-install server` again, or turn on automatic updates in `NanosSharp.toml`:

```toml title="NanosSharp.toml"
[update]
enabled = true
```

The launcher then checks for a newer release on each start and installs it before starting the server. Updates are only
applied when they are newer, and the previous version is kept and restored if an update cannot be unpacked. Make sure
the NanosSharp release supports your server version, NanosSharp checks the server binary on start and disables itself
with a clear message if something does not match.

Every release is signed. The installer verifies the signature against a key built into it and refuses anything that is
not a genuine, untampered NanosSharp release, so a hijacked download or mirror cannot slip in a malicious build.

Prefer containers? Use the [Docker image](docker.md), it ships the server, .NET and NanosSharp together.
