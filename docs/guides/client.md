---
sidebar_position: 2
---

# Client packages

C# also runs in the game client. Code in `Client/` runs on every player that has the
[NanosSharp client](../getting-started/client-setup.md) installed, code in `Shared/` runs on both sides.

```
my-gamemode/
├── Package.toml
├── Server/Gamemode.cs     runs on the server
├── Client/Hud.cs          runs on every player
├── Client/Index.lua       Lua fallback for players without NanosSharp
└── Shared/Teams.cs        runs on both sides
```

```csharp title="Client/Hud.cs"
public sealed class Hud : Package
{
    protected override void OnStart()
    {
        Events.SubscribeRemote("ScoreChanged", (long score) => Log.Info($"Score: {score}"));
        Input.OnKeyPress += (key, _) =>
        {
            if (key == "F")
            {
                Events.CallRemote("RequestScore");
            }

            return true;
        };
    }
}
```

The client API is generated from the game client just like the server API: `Client`, `Input`, `Viewport`, `Sky`,
`Trace`, `WebUI`, `Widget`, `Canvas`, `Sound` and every other client class are available with types and documentation.

## How client code is built

The server sends the `.cs` files of `Client/` and `Shared/` to the players together with the rest of the package. The
NanosSharp client compiles them on the player's machine when the package loads. There is no build step on your side.

`Shared/` is compiled into both sides. Use the `SERVER` and `CLIENT` symbols for code that only belongs to one of them:

```csharp title="Shared/Teams.cs"
public static class Teams
{
    public const int MaxPlayers = 16;

#if SERVER
    public static void Assign(Player player) => player.SetValue("team", Player.All.Count() % 2);
#endif
}
```

## The sandbox

Client code runs on your players' computers, so it is untrusted and runs inside a WebAssembly sandbox for real runtime
isolation. The package is compiled with Roslyn on the player's machine, outside the sandbox, and the compiled assembly
then runs inside it.

The sandbox restricts what the code can **reach**, not what it may **write**. The full C# language and base class
library are available: reflection, dependency injection, `async`/`await`, LINQ, `System.Text.Json`, `unsafe` and the
rest all compile and run. What the sandbox takes away is ambient authority. The code has:

- no file system access outside its own package directory,
- no network,
- no process creation,
- no native calls or P/Invoke to anything but the brokered engine API.

These are not rejected by a compiler. They have nothing to act on at runtime and fail: a package that calls
`File.WriteAllText`, `Process.Start`, `Environment.Exit` or `new HttpClient()` throws or is contained instead of
touching the machine. To reach the outside world, use the engine API the client exposes, for example
[`HTTP`](networking.md) for web requests and `ScriptFile` for the files nanos world allows access to.

Because the compiler and dependency resolver stay outside the sandbox, client packages cannot reference NuGet packages
or ship `.dll` files, and they have no hot reload. Everything else, including reflection and dependency injection, works
exactly as on the server.

See [Security](../reference/security.md) for the full trust model and what the sandbox does and does not guarantee.

## Differences to server packages

- `OnStart` runs one tick after the package loaded, when the game has finished setting up the package.
- `Package.Title`, `Version`, `GetFiles` and the persistent data are available as on the server.
- [Lua interop](lua-interop.md) works the same: `Exports.Get`, `Exports.Set`, `Exports.Call` and `[Export]`.

## Talking to the server

The client sends to the server, the server sends to one or all players. The handlers on the server receive the sending
player as the first parameter.

```csharp title="Client"
Events.CallRemote("Vote", "nanos-world::BlankMap");
Events.CallRemoteUnreliable("Aim", Viewport.ViewportSize);
```

```csharp title="Server"
Events.SubscribeRemote("Vote", (Player player, string map) => Log.Info($"{player.Name} voted {map}"));
Events.CallRemote("ScoreChanged", player, 120L);
```

`CallRemote` and `BroadcastRemote` are delivered reliably and in order. The `Unreliable` variants are cheaper but the
message may be lost or arrive out of order, use them for frequent values that are replaced by the next one anyway.

## Players without NanosSharp

Players can join without the NanosSharp client. They download the `.cs` files like any other file, but nothing runs
them. A package can ship a Lua fallback for these players. NanosSharp tells Lua whether the C# code of a package is
running:

```lua title="Client/Index.lua"
if Client.GetValue("NanosSharp:" .. Package.GetName()) then
    return
end

Console.Log("This server works best with NanosSharp: https://nanossharp.dasdarki.de")
```

The value is only set when the C# code of this package actually started. It is not set when the player has no NanosSharp
client, when the server does not run NanosSharp or when the client and the server speak different protocol versions.

### Knowing who has NanosSharp

When a player is ready, the server asks the client for its NanosSharp version. The result is available on the server:

```csharp
NanosSharpClients.Connected += (player, client) => Log.Info($"{player.Name} runs NanosSharp {client.Version}");
NanosSharpClients.Missing += player => player.SendMessage("Install NanosSharp for the full experience.");

if (player.HasNanosSharp)
{
    Events.CallRemote("ShowCSharpHud", player);
}
```

A player counts as missing when a Lua fallback reports it, when the protocol versions differ or when the client does not
answer within the configured time. A Lua fallback can report a missing client right away instead of letting the server
wait:

```lua title="Client/Index.lua"
if not Client.GetValue("NanosSharp") then
    Events.SubscribeRemote("nanossharp:handshake-request", function()
        Events.CallRemote("nanossharp:handshake")
    end)
end
```

### Requiring NanosSharp

A server can kick players without a compatible client:

```toml title="NanosSharp.toml"
[clients]
required = true
handshake_timeout_seconds = 30
kick_message = "This server requires NanosSharp {version}. Download it at https://nanossharp.dasdarki.de"
```

`{version}` is replaced with the NanosSharp version of the server. See [Configuration](../reference/configuration.md).
