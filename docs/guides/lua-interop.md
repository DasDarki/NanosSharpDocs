---
sidebar_position: 6
---

# Lua interop

Lua packages share values through `Package.Export`, which writes a global that every package can read. `Exports` is the
C# side of it. It works the same on the server and in [client packages](client.md).

## Calling Lua from C#

```lua title="Lua package"
Package.Export("Leaderboard", {
    Add = function(name, points) ... end,
    Top = function(count) ... end,
})
```

```csharp
Exports.Call("Leaderboard.Add", "DasDarki", 10);
var top = Exports.Call<string[]>("Leaderboard.Top", 3);
var table = Exports.Get("Leaderboard") as IDictionary;
```

`Get` converts the whole value, so keep a `ScriptFunction` for hot paths:

```csharp
var add = Exports.Get<ScriptFunction>("Leaderboard.Add")!;
add.Invoke("DasDarki", 10);
```

C# callbacks passed to Lua functions are wrapped with `ScriptCallback.From`:

```csharp
Exports.Call("Leaderboard.OnChange", ScriptCallback.From((string name) => Log.Info($"{name} changed")));
```

## Calling C# from Lua

Mark a static class or a static method with `[Export]`:

```csharp
[Export("MathLibrary")]
public static class MathLibrary
{
    public static int Multiply(int first, int second) => first * second;
}

public static class Shouting
{
    [Export]
    public static string Shout(string text) => text.ToUpperInvariant();
}
```

```lua
print(MathLibrary.Multiply(6, 7))
print(Shout("hi"))
```

A static class becomes a table of its public static methods, a method a single global function. Values and delegates
can also be exported by code:

```csharp
Exports.Set("ServerStartedAt", DateTime.UtcNow.ToString("O"));
Exports.Set("Greet", (Func<string, string>)(name => $"hello {name}"));
```

Exports are removed when their package unloads. Lua packages should look them up when they need them instead of
keeping a reference across a hot reload. Call exported functions with a dot, not a colon.
