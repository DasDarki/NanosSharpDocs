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

1. builds the native library and the managed runtime and packs the release bundle,
2. packs `NanosSharp` and `NanosSharp.Templates` and pushes them to NuGet through trusted publishing,
3. creates the GitHub release with the bundle attached,
4. builds the Docker image with the current nanos world server and pushes it to `ghcr.io/dasdarki/nanossharp`.

Tags with a suffix like `v0.2.0-preview.1` are published as pre-releases and do not move the `latest` image tag.
