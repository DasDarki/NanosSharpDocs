import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Getting started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/first-package',
        'getting-started/client-setup',
        'getting-started/docker',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/packages',
        'guides/client',
        'guides/api',
        'guides/events',
        'guides/entities',
        'guides/dependency-injection',
        'guides/async',
        'guides/lua-interop',
        'guides/networking',
        'guides/debugging',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: ['reference/configuration', 'reference/performance', 'reference/architecture', 'reference/security'],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: ['contributing/building', 'contributing/releasing'],
    },
  ],
};

export default sidebars;
