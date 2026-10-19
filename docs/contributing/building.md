---
sidebar_position: 1
---

# Building from source

Requirements: Linux x64, [xmake](https://xmake.io) 3, GCC or Clang with C++20 and the .NET 10 SDK.

```bash
git clone https://github.com/DasDarki/NanosSharp
cd NanosSharp
xmake                                  # native library
dotnet build managed/NanosSharp.slnx   # managed runtime, API and tools
xmake deploy -s /path/to/server        # install the runtime and the examples into a server
```

## Tasks

| Task | Description |
|---|---|
| `xmake deploy -s <server>` | Build and install NanosSharp into a server directory. |
| `xmake test` | Deploy into the server, run the integration tests in `tests/` and report the results. |
| `xmake test -d benchmarks` | Run the C# and Lua benchmarks. |
| `xmake bundle -r <version>` | Build the release archive in `build/release`. |
| `xmake dump-api` | Dump the native scripting API of the server for the generator. |
| `xmake generate` | Generate the typed API from the dump and the API definitions. |

The integration tests run inside a real server. `NANOSSHARP_TEST_FILTER=EventTests xmake test` runs a subset.

## Game client

The client is a `version.dll` for the Windows game, cross compiled on Linux with `clang-cl` against the Windows SDK and
CRT from [xwin](https://github.com/Jake-Shadle/xwin) in `~/.xwin`.

```bash
xwin --accept-license splat --output ~/.xwin
xmake client                           # builds into build/client
```

Copy the content of `build/client` into `NanosWorld/Binaries/Win64` of the game, see
[Client setup](../getting-started/client-setup.md). `manual-tests/nanossharp-client-tests` is a package that checks the
client API in a running game.

## Compatibility

The native library is built with the old `std::string` ABI of the server and checked after every build to require at
most the `GLIBC` and `GLIBCXX` versions the server itself needs.

## Generated code

`managed/NanosSharp/Generated` is generated, never edit it by hand. Change the generator or its supplements in
`managed/tools/NanosSharp.Generator/Data/Supplements` and run `xmake generate`. The output is deterministic and
`build/generator/report.md` lists everything that could not be mapped.
