---
sidebar_position: 2
---

# Releasing

Releases are built by the `publish` workflow when a version tag is pushed:

```bash
git tag v0.2.0
git push origin v0.2.0
```

The workflow

1. tests and packs the server bundle `nanossharp-<version>-linux-x64.tar.gz`,
2. cross compiles the game client with `clang-cl` and `xwin` and packs `nanossharp-client-<version>-win-x64.zip`,
3. publishes the installer as native executables for Linux and Windows,
4. packs `NanosSharp`, `NanosSharp.Client`, `NanosSharp.Shared` and `NanosSharp.Templates` and pushes them to NuGet
   through trusted publishing,
5. creates the GitHub release with every file, a `SHA256SUMS` file and build provenance attestations,
6. builds the Docker image with the current nanos world server and pushes it to `ghcr.io/dasdarki/nanossharp`.

The same files can be built locally:

```bash
xmake bundle -r 0.2.0       # server bundle
xmake client -r 0.2.0       # client bundle
xmake installer -r 0.2.0    # installer for the current system
```

`nanossharp-install server --from build/release` installs from these local files instead of GitHub.

Tags with a suffix like `v0.2.0-preview.1` are published as pre-releases and do not move the `latest` image tag.
