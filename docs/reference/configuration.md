---
sidebar_position: 1
---

# Configuration

NanosSharp reads `NanosSharp.toml` in the server directory and creates it with the defaults on the first start.
nanos world rewrites its own `Config.toml` and `Package.toml` files, so NanosSharp keeps its settings separate.

```toml title="NanosSharp.toml"
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
| `DOTNET_PerfMapEnabled=1` | Expose JIT compiled methods to `perf` for profiling. |
