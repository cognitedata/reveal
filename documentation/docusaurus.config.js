module.exports = {
  title: 'Reveal docs',
  tagline: 'The tagline of my site',
  url: 'https://cognitedata.github.io',
  baseUrl: '/reveal/',
  favicon: 'img/favicon.ico',
  organizationName: 'cognitedata',
  projectName: 'reveal',
  themeConfig: {
    navbar: {
      title: '@cognite/reveal',
      logo: {
        alt: 'Reveal logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo_dark.svg',
      },
      links: [
        // {
        //   to: 'docs/',
        //   activeBaseRegex: `docs/(?!(examples|api-reference))`,
        //   label: 'DOCS',
        //   position: 'left',
        // },
        // {
        //   to: 'docs/examples/Cognite3DViewer',
        //   activeBasePath: `docs/examples`,
        //   label: 'EXAMPLES',
        //   position: 'left',
        // },
        // {
        //   to: 'docs/api-reference',
        //   activeBasePath: `docs/api-reference`,
        //   label: 'API REFERENCE',
        //   position: 'left',
        // },
        {
          href: 'https://github.com/cognitedata/reveal',
          label: 'GITHUB',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      // links: [
      //   {
      //     title: 'Docs',
      //     items: [
      //       {
      //         label: 'Style Guide',
      //         to: 'docs/',
      //       },
      //       {
      //         label: 'Second Doc',
      //         to: 'docs/doc2/',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'Community',
      //     items: [
      //       {
      //         label: 'Stack Overflow',
      //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //       },
      //       {
      //         label: 'Discord',
      //         href: 'https://discordapp.com/invite/docusaurus',
      //       },
      //       {
      //         label: 'Twitter',
      //         href: 'https://twitter.com/docusaurus',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'More',
      //     items: [
      //       {
      //         label: 'Blog',
      //         to: 'blog',
      //       },
      //       {
      //         label: 'GitHub',
      //         href: 'https://github.com/facebook/docusaurus',
      //       },
      //     ],
      //   },
      // ],
      copyright: `Copyright © ${new Date().getFullYear()} <a href="//cognite.com">Cognite</a>`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // It is recommended to set document id as docs home page (`docs/` path).
          homePageId: 'overview',
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/cognitedata/reveal/blob/master/documentation',
          remarkPlugins: [require('./src/plugins/remark-npm2yarn')],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
};
