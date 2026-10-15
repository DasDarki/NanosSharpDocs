import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'NanosSharp',
  tagline: 'Write nanos world server packages in C#',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
    faster: true,
  },

  url: 'https://nanossharp.dasdarki.de',
  baseUrl: '/',
  trailingSlash: false,

  organizationName: 'DasDarki',
  projectName: 'NanosSharpDocs',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/DasDarki/NanosSharpDocs/tree/master/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/banner.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'NanosSharp',
      logo: {
        alt: 'NanosSharp',
        src: 'img/logo.png',
      },
      items: [
        {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'},
        {href: 'https://www.nuget.org/packages/NanosSharp', label: 'NuGet', position: 'right'},
        {href: 'https://github.com/DasDarki/NanosSharp', label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Getting started', to: '/docs/getting-started/installation'},
            {label: 'Writing packages', to: '/docs/guides/packages'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'GitHub', href: 'https://github.com/DasDarki/NanosSharp'},
            {label: 'NuGet', href: 'https://www.nuget.org/packages/NanosSharp'},
            {label: 'Docker image', href: 'https://github.com/DasDarki/NanosSharp/pkgs/container/nanossharp'},
          ],
        },
        {
          title: 'nanos world',
          items: [
            {label: 'Website', href: 'https://nanos-world.com'},
            {label: 'Lua API', href: 'https://docs.nanos-world.com'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} DasDarki. NanosSharp is not affiliated with nanos world.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'toml', 'lua', 'bash', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
