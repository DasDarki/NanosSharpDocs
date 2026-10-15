---
sidebar_position: 3
---

# Docker

Every release publishes an image with the nanos world server, the .NET runtime and NanosSharp:

```bash
docker pull ghcr.io/dasdarki/nanossharp:latest
```

Tags follow the NanosSharp version: `latest`, `0.1` and `0.1.0`. Each image contains the nanos world server version
that was current when the release was built.

## Running

```bash
docker run -d --name nanos \
  -p 7777:7777/udp -p 7777:7777/tcp -p 7778:7778/udp \
  -v "$PWD/Packages:/nanos/Packages" \
  -v "$PWD/Assets:/nanos/Assets" \
  ghcr.io/dasdarki/nanossharp:latest \
  --name "My Server" --max_players 32
```

Arguments after the image name are passed to the server. The server lives in `/nanos` and runs as the user `nanos`.

| Path | Purpose |
|---|---|
| `/nanos/Packages` | your packages, a volume |
| `/nanos/Assets` | your assets, a volume |
| `/nanos/Config.toml` | server configuration, mount a file to keep it |
| `/nanos/NanosSharp.toml` | NanosSharp configuration |
| `/nanos/NanosSharp/cache` | NuGet cache of script packages |

## Compose

```yaml title="compose.yaml"
services:
  nanos:
    image: ghcr.io/dasdarki/nanossharp:latest
    command: ["--name", "My Server", "--max_players", "32"]
    ports:
      - "7777:7777/udp"
      - "7777:7777/tcp"
      - "7778:7778/udp"
    volumes:
      - ./Packages:/nanos/Packages
      - ./Assets:/nanos/Assets
      - ./Config.toml:/nanos/Config.toml
    restart: unless-stopped
```

## Building the image yourself

The image is built from a NanosSharp bundle, so build one first:

```bash
xmake bundle
docker build -f docker/Dockerfile -t nanossharp .
```

`--build-arg NANOS_BETA=bleeding-edge` builds the image with a beta branch of the server.
