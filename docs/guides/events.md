---
sidebar_position: 3
---

# Events

NanosSharp offers four ways to handle events, from closest to Lua to most C#-like. Use whatever fits.

## Class events

Every event of a class is a static C# event with typed parameters, like `Character.Subscribe("Death", ...)` in Lua.

```csharp
Character.OnDeath += (character, damage, bone, type, direction, instigator, causer) =>
    Log.Info($"{character} died");

Player.OnReady += player => player.SendMessage("Welcome!");
Server.OnTick += deltaTime => { };
```

Handlers are removed automatically when their package unloads.

## Events of one entity

```csharp
var subscription = character.SubscribeTakeDamage((self, damage, bone, type, direction, instigator, causer) =>
    Log.Info($"{damage} damage"));

subscription.Dispose();
```

## Event classes

Methods marked with `[ServerEvent]` receive typed event objects. Handlers on package entry points are registered
automatically, other objects with `EventBus.Register(listener)`.

```csharp
public sealed class Gameplay : Package
{
    [ServerEvent]
    private void OnDeath(CharacterDeathEvent e) => Log.Info($"{e.Character} was killed by {e.Instigator}");

    [ServerEvent(Priority = -10)]
    private void OnChat(ChatPlayerSubmitEvent e)
    {
        if (e.Message?.Contains("spam") == true)
        {
            e.Cancel();
        }
    }
}
```

Handlers run by `Priority`, lower values first. Events that can be cancelled in Lua by returning `false` derive from
`CancellableEvent`. A cancelled event is not passed to later handlers unless they set `ReceiveCancelled = true`.

## Entity hooks

Entity subclasses can override a `Handle<Event>` method for every event, see [Entities](entities.md#hooks).

## Custom events

```csharp
Events.Subscribe("RoundStarted", (int round) => Log.Info($"Round {round}"));
Events.Call("RoundStarted", 3);

Events.SubscribeRemote("Vote", (Player player, string map) => Log.Info($"{player.Name} voted {map}"));
Events.CallRemote("ShowScoreboard", player, 10, "points");
Events.BroadcastRemote("RoundEnded", winner.Name);
Events.BroadcastRemoteUnreliable("Wind", windDirection);
```

Remote events are delivered reliably and in order. The `Unreliable` variants are cheaper but may lose messages or
deliver them out of order. On the client `Events.CallRemote(name, ...)` sends to the server, see
[Client packages](client.md#talking-to-the-server).

Handler parameters are converted from the event arguments, extra arguments are ignored and missing ones are `null` or
the default value. Lua packages receive the same events and arguments.
