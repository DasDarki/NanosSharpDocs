---
sidebar_position: 1
---

# Configuration

NanosSharp reads `NanosSharp.toml` in the server directory and creates it with the defaults on the first start.
nanos world rewrites its own `Config.toml` and `Package.toml` files, so NanosSharp keeps its settings separate.

```toml title="NanosSharp.toml"
[clients]
required = false
handshake_timeout_seconds = 30
kick_message = "This server requires NanosSharp {version}. Download it at https://nanossharp.dasdarki.de"

[update]
enabled = false

[debug]
enabled = false

[compilation]
optimize = true

[hot_reload]
enabled = true
delay_milliseconds = 500
verify_unload = true

[nuget]
sources = ["https://api.nuget.org/v3/index.json"]

[projects]
generate = true
```

| Setting | Description |
|---|---|
| `clients.required` | Kick players without a compatible [NanosSharp client](../guides/client.md#players-without-nanossharp). |
| `clients.handshake_timeout_seconds` | Time a ready player has to report its NanosSharp client. |
| `clients.kick_message` | Message for kicked players, `{version}` is replaced with the server version. |
| `update.enabled` | Check for a newer signed release on each start and install it (server). |
| `debug.enabled` | Turn on [debugging](../guides/debugging.md): build packages unoptimized and let clients debug. |
| `compilation.optimize` | Compile script packages with optimizations. Disable it for easier debugging. |
| `hot_reload.enabled` | Watch `Server/` of every C# package and reload it on changes. |
| `hot_reload.delay_milliseconds` | Time without further changes before a reload starts. |
| `hot_reload.verify_unload` | Check that the assemblies of a reloaded package were unloaded and warn about leaks. |
| `nuget.sources` | NuGet feeds used to restore `PackageReference` items of script packages. |
| `projects.generate` | Generate `Server/<package>.csproj` for script packages without a project file. |

## Environment variables

| Variable | Description |
|---|---|
| `DOTNET_ROOT` | Location of the .NET runtime when it is not installed in a default location. |
| `NANOSSHARP_DEBUG` | Set to `1` in the game's launch options to let this client debug, see [Debugging](../guides/debugging.md). |
| `DOTNET_PerfMapEnabled=1` | Expose JIT compiled methods to `perf` for profiling. |
