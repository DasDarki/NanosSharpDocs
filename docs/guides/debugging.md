---
sidebar_position: 8
---

# Debugging

NanosSharp hosts a regular .NET runtime, so you debug packages by attaching a .NET debugger to the process. Because
packages are compiled in memory, two things have to be true for a good experience, and NanosSharp sets both up for you
when debugging is enabled:

- Packages are compiled **unoptimized**, so breakpoints and locals behave.
- Their **symbols** are loaded with the assembly, so the debugger maps the running code to your `.cs` files.

The server is the authority. Debugging is only enabled when the server opts in, and for a client the player opts in as
well. It never opens a network port, so it adds no attack surface.

## The `Debugger` helper

Drop `Debugger.Break()` where you want execution to stop. When debugging is enabled it launches or breaks into a debugger
right at that line, otherwise it does nothing, so it is safe to leave in your code.

```csharp
protected override void OnStart()
{
    Debugger.Break();              // launches your IDE here when debugging is on
    var player = Client.LocalPlayer;
}
```

`Debugger.IsEnabled` and `Debugger.IsAttached` are available too.

## Debugging the server

Turn it on in `NanosSharp.toml`:

```toml title="NanosSharp.toml"
[debug]
enabled = true
```

On start the server logs its process id:

```
Debug mode is on. Attach a .NET debugger to this process (PID 12345).
```

Attach your IDE to that process as **.NET** code. A generated package project also gets a `.vscode/launch.json` with an
"Attach to the NanosSharp server" configuration, so in VS Code it is one click. For a remote server, run
[netcoredbg](https://github.com/Samsung/netcoredbg) and connect over SSH, bound to localhost only, never to a public
port.

## Debugging a client package

Debugging client packages works on a native Windows game client. Under Proton it does not, because a .NET debugger
cannot attach to the runtime inside Wine, so debug client code on Windows or move it to `Shared/` and debug it on the
server.

1. The server enables debugging with `[debug] enabled = true`.
2. The player opts in by adding this to the launch options of nanos world in Steam:

   ```
   NANOSSHARP_DEBUG=1 %command%
   ```

3. Join the server. The client logs its process id, and `Debugger.Break()` becomes active. Attach your IDE to the game
   process as .NET code, or let `Debugger.Break()` launch it for you.

Both sides have to opt in. The server flag alone never enables debugging on a client, and without the launch option the
client ignores it.
