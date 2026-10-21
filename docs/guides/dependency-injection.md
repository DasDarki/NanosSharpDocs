---
sidebar_position: 5
---

# Dependency injection

NanosSharp has a small dependency injection container built in. Every package gets its own container, so you register
services once instead of handing static `Instance` singletons around. It works the same on the server and in the game
client, and it is sandbox safe: the container lives in the runtime, your package never touches reflection itself.

## Services

A service is a singleton with a lifecycle. Implement `IService` or derive from `Service` and override only what you
need. The container finds every service in your package, creates it and starts it when the package loads, `StartAsync`
and `StopAsync` run on the main thread.

```csharp
public sealed class Economy : Service
{
    private readonly Dictionary<string, int> _balances = [];

    public override Task StartAsync(CancellationToken token)
    {
        Log.Info("economy ready");
        return Task.CompletedTask;
    }

    public int BalanceOf(string account) => _balances.GetValueOrDefault(account);
}
```

## Injecting services

Mark a field or property with `[Inject]` to receive another service, and `[OnInit]` for setup that runs once every
injection is resolved. A package entry point reaches the container through `Services`:

```csharp
public sealed class Shop : Service
{
    [Inject] private Economy _economy = null!;

    [OnInit]
    private void Ready() => Log.Info("shop online");

    public bool CanAfford(string account, int price) => _economy.BalanceOf(account) >= price;
}

public sealed class Gamemode : Package
{
    [Inject] private Shop _shop = null!;

    protected override void OnStart() => Services.Add(new Config());
}
```

`Get<T>`, `GetRequired<T>`, `GetAll<T>`, `Any<T>` and `Add` round out the container. Injection resolves by assignable
type, so you can inject an interface a service implements.

## Event handlers without a package

A class that implements `IAutoRegister` is created as a singleton and has its `[ServerEvent]` handlers registered just
like a package entry point. Use it to split event handling into services:

```csharp
public sealed class Combat : IAutoRegister
{
    [Inject] private Economy _economy = null!;

    [ServerEvent]
    private void OnDamage(CharacterTakeDamageEvent damage) => Log.Info($"{damage.Character} took {damage.Damage}");
}
```

## Scheduled and background work

`ScheduledService` runs on the game tick instead of a timer. Give it an interval, override `OnTick`, and it runs on the
main thread each time the interval elapsed, `TimeSpan.Zero` runs on every frame:

```csharp
public sealed class Payout : ScheduledService
{
    [Inject] private Economy _economy = null!;

    public Payout() : base(TimeSpan.FromSeconds(60))
    {
    }

    protected override void OnTick(float deltaTime) => Log.Info("payout");
}
```

`BackgroundService` runs its `StartAsync` off the main thread until the package stops, use it for work that never
touches nanos world. `ISkippedService` is registered and injected but not started automatically.

## Lifecycle

When a package loads the container creates every service and auto-register, resolves `[Inject]`, runs `[OnInit]`,
registers event handlers, runs `IService.StartAsync`, attaches scheduled services to the tick, then runs the package
`OnStart`. On unload the order reverses and `StopAsync` runs.

## Notes

- Services need a parameterless constructor; dependencies come through `[Inject]` fields or properties, not the
  constructor.
- The start order of services is not guaranteed. An injected service is always set, but if one service's `StartAsync`
  depends on another having started, order it yourself from `[OnInit]` or the package `OnStart`.
- `StopAsync` runs during the synchronous unload, so keep it fast. Background and scheduled services are cancelled and
  detached cleanly on unload.
