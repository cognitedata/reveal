module.exports = {
  title: 'Reveal docs',
  tagline: '@cognite/reveal documentation site',
  url: 'https://cognitedata.github.io',
  baseUrl: '/reveal-docs/',
  favicon: 'img/favicon.ico',
  organizationName: 'cognitedata',
  projectName: 'reveal',
  themeConfig: {
    algolia: {
      appId: 'WK4NHSAX9S',
      apiKey: '9ba8640575bd74e729c9e6a29dfb8a78',
      indexName: 'reveal-docs',

      contextualSearch: true,
    },
    prism: {
      // changes syntax highlighting theme
      theme: require('prism-react-renderer/themes/oceanicNext'),
    },
    navbar: {
      title: '@cognite/reveal',
      logo: {
        alt: 'Reveal logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo_dark.svg',
      },
      items: [
        {
          type: 'docsVersionDropdown',
          position: 'left',
        },
        {
          href: 'https://github.com/cognitedata/reveal',
          label: 'GITHUB',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `Copyright © ${new Date().getFullYear()} <a href="//cognite.com">Cognite</a>`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml'
        },
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/cognitedata/reveal/blob/master/documentation',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
            require('./src/plugins/remark-runnable-reveal-demo'),
          ],
          showLastUpdateTime: true,
          include: ['**/*.{md,mdx}'],
          exclude: [
            '**/node_modules/**/*.{md,mdx}'
          ]
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    require.resolve('./docusaurus_plugins/docusaurusWebpack5Plugin'),
    'docusaurus-plugin-typedoc'
  ],
};
