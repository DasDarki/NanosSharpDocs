---
sidebar_position: 4
---

# Entities

Entities are C# objects that stay the same for the lifetime of the entity. The same `Player` instance is passed to every
event, so it can hold your own state.

```csharp
var prop = new Prop(new Vector(0, 0, 100), Rotator.Zero, "nanos-world::SM_Cube");
prop.Destroyed += _ => Log.Info("gone");
prop.Destroy();
Log.Info(prop.IsValid ? "alive" : "destroyed");
```

Calling a method on a destroyed entity throws an `ObjectDisposedException`. Use `IsValid` when an entity might be gone.

## Own entity classes

Derive from an entity class to spawn entities with your own type:

```csharp
public sealed class ExplosiveBarrel(Vector location) : Prop(location, Rotator.Zero, "nanos-world::SM_Cube")
{
    public int Charges { get; set; } = 3;
}

var barrel = new ExplosiveBarrel(new Vector(0, 0, 100));
```

Events and lookups return the `ExplosiveBarrel` instance for this entity.

## Entity factories

To wrap every entity of a class with your own type, also the ones spawned by Lua or by nanos world, mark the class with
`[EntityFactory]`:

```csharp
[EntityFactory]
public class RoleplayPlayer : Player
{
    public int Money { get; set; }
}

Player.OnReady += player => ((RoleplayPlayer)player).Money = 500;
```

Existing entities are rebound when the factory registers and back to the default type when its package unloads.
Factories can also be registered by code with `EntityFactory.Register<TEntity>()`.

## Hooks

Entity classes have a `protected virtual` method for every event of the entity, named `Handle<Event>`. Override them
in your own classes instead of subscribing to events:

```csharp
[EntityFactory]
public class RoleplayPlayer : Player
{
    public int Money { get; set; }

    protected override void HandleReady() => SendMessage($"You have {Money} dollars.");
}

public sealed class Crate(Vector location) : Prop(location, Rotator.Zero, "nanos-world::SM_Cube")
{
    protected override void HandleTakeDamage(int damage, string? bone, DamageType type, Vector fromDirection,
        Player? instigator, Actor? causer) => Log.Info($"Crate took {damage} damage");
}
```

Only the hooks a class overrides are subscribed, per entity. They are released when the entity is destroyed or its
package unloads. Hooks of events that can be cancelled return `bool`, returning `false` cancels the event.
