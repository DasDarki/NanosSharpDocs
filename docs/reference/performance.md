---
sidebar_position: 2
---

# Performance

The benchmark packages in the NanosSharp repository run the same operations from C# and Lua inside the server, after
a warmup of 500 ms with one million iterations each.

| Operation | Lua | C# |
|---|---|---|
| Static getter (`Server.GetTickRate`) | ~55 ns | ~20 ns |
| Entity getter (`GetLocation`) | ~260 ns | ~40 ns |
| Entity setter (`SetLocation`) | ~245 ns | ~75 ns |
| Event roundtrip (`Events.Call` with one handler) | ~255 ns | ~300 ns |
| Prime sieve up to 2 000 000 | ~58 ms | ~3.5 ms |
| Sorting 200 000 numbers | ~45 ms | ~28 ms |

Calls into nanos world are faster than from Lua because NanosSharp uses the engine's reflection layer directly instead
of the Lua stack. Events are slightly slower, they cross between .NET and native code twice and every handler gets its
own copy of each string. Code that runs in C# itself is many times faster than Lua.

## Why it is fast

- Generated methods write their arguments as typed blittable structs, without boxing or allocations.
- Methods are resolved once per class and cached in slots.
- Callbacks read their parameters directly from the native arguments through compiled invokers.
- Script packages are compiled with optimizations and run through the tiered JIT like any .NET application.

## Tips

- Prefer the typed API over `ScriptApi.Invoke` and `Entity.Invoke` in hot paths.
- Keep `ScriptFunction` references instead of looking up Lua exports every time.
- Batch work in C# and call into nanos world only with the results.
