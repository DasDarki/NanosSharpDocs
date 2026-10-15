---
sidebar_position: 1
---

# Packages

## Entry points

Every non-abstract class deriving from `Package` is an entry point of its package. NanosSharp creates it when the
package loads and calls `OnStart`. `OnStop` runs before the package unloads.

```csharp
public sealed class Gamemode : Package
{
    protected override void OnStart() => Log.Info($"{Title} {Version} started in {Directory}");

    protected override void OnStop() => Log.Info("Bye");
}
```

`Package` also exposes what Lua offers through `Package.*`:

| Member | Description |
|---|---|
| `Name`, `Title`, `Version`, `Directory` | package information |
| `GetFiles(path, extension)`, `GetDirectories(path)` | files of the package |
| `GetPersistentData<T>(key)`, `SetPersistentData(key, value)`, `FlushPersistentData()` | persistent data |
| `IsUnloading` | whether the package is being unloaded |

A package can have more than one entry point, they start in a stable order.

## Script packages and assembly packages

Script packages contain `.cs` files in `Server/`, compiled by the server with Roslyn. Assembly packages contain
compiled `.dll` files in `Server/`. Both can be mixed: scripts are compiled against the assemblies next to them.

Script packages get the same global usings as the [project template](../getting-started/first-package.md), so
`NanosSharp.Core`, `NanosSharp.Entities`, `NanosSharp.Eventing` and the other API namespaces are available without
`using` directives. Scripts are compiled with optimizations unless they are disabled in the
[configuration](../reference/configuration.md).

## NuGet packages

`PackageReference` items in the project file of a script package are restored by the server itself, so the server needs
no .NET SDK. Transitive dependencies and native libraries are resolved, the cache lives in `NanosSharp/cache/nuget`.

```xml title="Server/MyGamemode.csproj"
<ItemGroup>
  <PackageReference Include="Microsoft.Data.Sqlite" Version="10.0.13" />
</ItemGroup>
```

Every package gets its own copy of its libraries, so two packages can use different versions of the same library.
The `NanosSharp` package itself is provided by the server and never restored.

Assembly packages ship their dependencies themselves: everything `dotnet build` or `dotnet publish` puts into `Server/`,
including `*.deps.json` and native libraries in `runtimes/`, is resolved automatically.

## Sharing code between packages

A package listed in `packages_requirements` of another package shares its assemblies with it. The dependent package can
use its public types directly, and is reloaded together with it.

```toml title="Package.toml"
[script]
    packages_requirements = [
        "my-library",
    ]
```

## Hot reload

Changing a `.cs` or `.dll` file in `Server/` rebuilds the package. If the build fails, the running version stays active
and the errors are logged. Otherwise the package is reloaded through nanos world itself, followed by every C# package
that requires it.

State is not preserved across a reload. Keep it in entity values, persistent data, a database or a package that is not
reloaded. After a reload NanosSharp checks that the previous assemblies were unloaded and names packages that still
hold references, for example running tasks, threads or static event handlers outside of nanos world.

Hot reload can be configured or disabled in [`NanosSharp.toml`](../reference/configuration.md).

## Console commands

```csharp
Commands.Register("heal", arguments => Log.Info($"healing {arguments.Length} players"), "Heals players");
```
