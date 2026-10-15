---
sidebar_position: 2
---

# Your first package

The quickest start are the `dotnet new` templates.

```bash
dotnet new install NanosSharp.Templates
```

## Script package

A script package contains `.cs` files that the server compiles itself. This is the closest to how Lua packages work.

```bash
cd /path/to/nanos-world-server/Packages
dotnet new nanossharp-script -n MyGamemode -o my-gamemode --title "My Gamemode" --package-author "You"
```

```
my-gamemode/
 ├─ Package.toml
 └─ Server/
     ├─ MyGamemode.cs
     └─ MyGamemode.csproj     only used by your IDE
```

```csharp title="Server/MyGamemode.cs"
public sealed class MyGamemode : Package
{
    protected override void OnStart()
    {
        Log.Info($"{Title} started.");
        Player.OnReady += OnPlayerReady;
    }

    protected override void OnStop() => Log.Info($"{Title} stopped.");

    private static void OnPlayerReady(Player player)
    {
        var character = new Character(new Vector(0, 0, 200), Rotator.Zero, "nanos-world::SK_Mannequin");
        player.Possess(character);
        player.SendMessage($"Welcome {player.Name}!");
    }
}
```

Add the package to the server like any other package, for example with `--packages my-gamemode` or in `Config.toml`,
and start the server with `./NanosSharp.sh`. Open `Server/MyGamemode.csproj` in Rider, Visual Studio or VS Code for
IntelliSense. Every save rebuilds and reloads the package, see [Hot reload](../guides/packages.md#hot-reload).

:::tip Names
Use a valid C# identifier for `-n`, it becomes the class name. The folder name given with `-o` is the package name
nanos world uses.
:::

## Assembly package

An assembly package is a regular .NET project that you build yourself. Use it for bigger projects, shared libraries or
when you want full control over the build.

```bash
dotnet new nanossharp-assembly -n MyLibrary -o my-library
cd my-library
dotnet build
```

The project builds straight into the `Server/` folder of the package, the server picks up the new assembly and reloads
the package. The template references the `NanosSharp` NuGet package with `ExcludeAssets="runtime"`, so the API assembly
is never copied next to your code, the server provides it.

## Without templates

A C# package only needs a `Package.toml` and at least one `.cs` or `.dll` file in `Server/`. When a script package has no
project file, the server generates `Server/<package>.csproj` on the first load so your IDE still works.
