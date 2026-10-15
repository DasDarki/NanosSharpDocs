---
sidebar_position: 2
---

# Using the API

The C# API is generated from the server and the official [Lua API](https://docs.nanos-world.com). If you know the Lua
API, you know the C# API.

## Lua style and C# style

Every Lua function exists with the same name. Getters and setters are additionally available as properties.

```csharp
var prop = new Prop(new Vector(0, 0, 100), Rotator.Zero, "nanos-world::SM_Cube");  // Prop(...) in Lua
prop.SetScale(new Vector(2, 2, 2));                                                 // prop:SetScale(...) in Lua
prop.Scale = new Vector(2, 2, 2);                                                   // the same call as a property
var health = character.Health;
var money = player.GetValue<int>("money");

Server.SetValue("round", 3);
var round = Server.GetValue("round");
```

Static classes like `Server`, `Chat`, `Console` (named `ScriptConsole`), `HTTP` and `Assets` live in `NanosSharp.Core`,
entities like `Player`, `Character`, `Prop` or `Weapon` in `NanosSharp.Entities`, enums in `NanosSharp.Enums` and
`Vector`, `Rotator`, `Color` and `Vector2D` in `NanosSharp.Mathematics`.

Optional Lua parameters are optional C# parameters. Functions that take callbacks also have `Task` overloads, see
[Async](async.md).

## The main thread

nanos world is single threaded. Every call into the API must happen on the main thread, a call from another thread
throws an `InvalidOperationException`. Code in event handlers, `OnStart` and continuations of `await` already runs on
the main thread. From background work use:

```csharp
MainThread.Post(() => Chat.BroadcastMessage("done"));
var name = await MainThread.InvokeAsync(() => Server.Name);
```

## Timers

```csharp
await Scheduler.Delay(TimeSpan.FromSeconds(5));
await Scheduler.NextTick();

var id = ScriptTimer.SetInterval(() => Log.Info("tick"), 1000);
ScriptTimer.Bind(id, character);      // stops when the character is destroyed
ScriptTimer.ClearInterval(id);
```

Returning `false` from an interval callback stops it, like in Lua.

## Logging

```csharp
Log.Info("message");
Log.Warning("careful");
Log.Error("failed");
Log.Exception(exception, "while loading the map");
```

## Everything else

Functions without a typed wrapper yet are reachable dynamically:

```csharp
ScriptApi.Invoke("Server", "GetMap");
var location = entity.Invoke<Vector>("GetLocation");
```

Calls into nanos world that fail throw a `ScriptException` with the message of the server.
