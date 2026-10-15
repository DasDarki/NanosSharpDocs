# NanosSharp Docs

Documentation of [NanosSharp](https://github.com/DasDarki/NanosSharp), built with [Docusaurus](https://docusaurus.io)
and served at https://dasdarki.de/nanossharp/.

```bash
npm install
npm start        # development server
npm run build    # static site in build/
```

## Cloudflare Pages

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `build` |
| Environment variable | `NODE_VERSION=22` |

The site is built for the base path `/nanossharp/`. Route `dasdarki.de/nanossharp/*` to the Pages project, for example
with a Worker or a redirect rule, or change `baseUrl` in `docusaurus.config.ts` when hosting it at the root of a domain.
