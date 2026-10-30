---
sidebar_position: 7
---

# Package APIs

When one C# package needs to call another, you can go through the untyped Lua [`Exports`](lua-interop.md) - but between
C# packages that throws away everything C# gives you: types, generics, events, `async`, refactoring and IDE support. The
`PackageApi` surface lets a package expose a typed API that other C# packages consume directly, as if they referenced its
assembly as a library. Use `Exports` for Lua packages and loose, dynamic coupling; use `PackageApi` for typed C# to C#.

It works the same on the server and inside the client [sandbox](client.md): the registry is ordinary managed code in the
shared runtime, so a cross package call is just a method call and adds no new authority on the client.

## Declaring the dependency

A consumer declares which packages it depends on in its `Package.toml`:

```toml
[script]
    packages_requirements = ["economy"]   # hard: must be loaded, reloads this package when it changes
    packages_optional =     ["bonus"]     # soft: shared when present, absence is fine
```

Both make the dependency's assembly available at compile time (IDE autocomplete, type checking) and share its loaded
assembly at runtime, so a contract is the same `Type` on both sides. A hard requirement must be present; an optional one
may be missing, which is what `TryGet` and the `PackageApi<T>` handle are for.

## Providing an API

The provider exposes a contract - usually an interface - and publishes an implementation. The cleanest layout puts the
contract in a small library package that both the provider and its consumers require, so the contract's type identity
stays stable even when the provider hot reloads.

```csharp title="economy package"
public interface IEconomyApi
{
    long GetBalance(Player player);
    void AddMoney(Player player, long amount);
    event Action<Player, long> BalanceChanged;
}

[PackageApi]
public sealed class EconomyApi : IEconomyApi
{
    // published under IEconomyApi, every other non framework interface it implements, and the concrete type
}
```

`[PackageApi]` registers the class as the package's dependency injection singleton, so it can `[Inject]` other services
and is injected into them. Pass contracts to narrow what it is published under:

```csharp
[PackageApi(typeof(IEconomyApi))]          // only IEconomyApi (and the concrete type)
public sealed class EconomyApi : IEconomyApi, IInternalThing { /* ... */ }
```

Or publish explicitly from your entry point, which is handy when the instance is built at runtime:

```csharp
protected override void OnStart() => PackageApi.Provide<IEconomyApi>(new EconomyApi());
```

A contract may only be provided by one package at a time; a second provider throws.

## Consuming an API

Resolve by contract. Which call you pick expresses whether the dependency is required and how it behaves across reloads:

```csharp
var economy = PackageApi.Require<IEconomyApi>();   // the live instance, throws when no package provides it
var economy = PackageApi.Get<IEconomyApi>();       // the live instance or null
PackageApi.TryGet<IBonusApi>(out var bonus);       // true and the instance, or false - for optional dependencies
```

Or inject it like any service - the container falls back to the package registry for types it does not own itself:

```csharp
public sealed class Shop : Service
{
    [Inject] private IEconomyApi _economy = null!;             // required, resolved once at start
    [Inject(IsRequired = false)] private IBonusApi? _bonus;    // optional
    [Inject] private PackageApi<IEconomyApi> _economyHandle;   // a handle, re resolves on every access
}
```

## Reloads

A resolved instance (`Require`, `Get`, a plain `[Inject]`) points at the provider that was loaded at that moment.
Changing a hard requirement reloads its dependents, so after a provider reload the consumer is rebuilt and resolves the
new instance automatically. If you want the provider to hot reload **without** restarting the consumer, hold a
`PackageApi<T>` handle (or call `PackageApi.Get` on each use): the handle re resolves every time, so it keeps working as
long as the contract's type identity is stable - which is why a shared contract library package is recommended.

```csharp
if (_economyHandle.IsAvailable)
{
    _economyHandle.Value!.AddMoney(player, 100);   // always the current provider instance
}
```

## Versus Exports

| | `PackageApi` | `Exports` |
| --- | --- | --- |
| Between | C# and C# packages | Lua and C#, or dynamic C# coupling |
| Types | full C#: generics, events, async, refactoring | values marshalled through Lua, untyped |
| Resolution | by contract type | by string path |
| IDE support | yes, via the referenced package | no |

Keep using `Exports` to talk to Lua packages; reach for `PackageApi` whenever both sides are C#.
