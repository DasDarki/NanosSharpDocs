---
sidebar_position: 5
---

# Async

`await` works like everywhere else in .NET, with one addition: code after an `await` that started on the main thread
continues on the main thread, so it can use the API right away.

```csharp
protected override async void OnStart()
{
    await Scheduler.Delay(TimeSpan.FromSeconds(5));
    Chat.BroadcastMessage("Five seconds after the start");
}
```

## Task overloads

Functions that report their result through a callback in Lua have `Task` overloads with the same name:

```csharp
var response = await HTTP.RequestAsync("https://api.example.com", "/status");
if (response.IsSuccess)
{
    Log.Info(response.Data);
}

var database = new Database(DatabaseEngine.SQLite, "db=server.db");
var affected = await database.ExecuteAsync("DELETE FROM sessions WHERE expires < ?", now);
var rows = await database.SelectAsync("SELECT name FROM players WHERE id = ?", playerId);
var name = rows[0]["name"] as string;

var file = new ScriptFile("data.json");
var content = await file.ReadAsync();
```

Database errors are thrown as `DatabaseException`. The Lua style overloads with a callback remain available.

## Background work

Heavy computations can run on the thread pool with `Task.Run`. Calls into nanos world must go back to the main thread,
either by awaiting from main thread code or with `MainThread.InvokeAsync`:

```csharp
var result = await Task.Run(() => CalculateNavigation());
Chat.BroadcastMessage($"done: {result}");
```

:::caution
A task that is still running when its package unloads keeps the old assemblies alive. Stop long running work in
`OnStop`, for example with a `CancellationToken`.
:::
