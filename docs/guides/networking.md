---
sidebar_position: 7
---

# HTTP, WebSockets and data

## HTTP requests

```csharp
var response = await HTTP.RequestAsync("https://api.example.com", "/players", HTTPMethod.POST,
    "{\"name\":\"DasDarki\"}", "application/json", headers: new Dictionary<string, string> { ["Authorization"] = token });

Log.Info($"{response.Status}: {response.Data}");
```

`HttpClient` from .NET works as well. Remember to come back to the main thread before using the API.

## HTTP server routes

The server can answer HTTP requests on its game port when it runs with `--enable_http_server`. Routes are served below
`/scripting`:

```csharp
using var route = HTTPServer.Route(HTTPMethod.GET, "/status",
    request => HttpServerResponse.Json($"{{\"players\":{Player.All.Count()}}}"));
```

`http://server:7777/scripting/status` now answers with the JSON. Handlers can be `async`, receive the body, query
parameters, headers and the remote address, and answer with a status, body, content type and headers. An exception in a
handler is logged and answered with status 500. Disposing the route unregisters it.

## WebSockets

```csharp
var socket = new WebSocket("wss://example.com/socket");
socket.SubscribeReceiveMessage((_, message) => Log.Info($"received {message}"));
socket.SubscribeClose(_ => Log.Info("closed"));
socket.Send("hello");
socket.Close();
```

## Databases

```csharp
var database = new Database(DatabaseEngine.SQLite, "db=server.db timeout=2");
await database.ExecuteAsync("CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, money INTEGER)");
var rows = await database.SelectAsync("SELECT money FROM players WHERE id = ?", player.SteamID);
```

MySQL and PostgreSQL work with `DatabaseEngine.MySQL` and `DatabaseEngine.PostgreSQL`. Any .NET database library from
NuGet works as well.

## JSON and TOML

The nanos world parsers convert between strings and Lua style tables, including `Vector` and other structs:

```csharp
var json = JSON.Stringify(new Dictionary<string, object?> { ["spawn"] = new Vector(0, 0, 100) });
var table = JSON.Parse(json);
var config = TOML.Parse(File.ReadAllText("settings.toml"));
```

For your own types `System.Text.Json` and other .NET serializers are usually the better choice.
