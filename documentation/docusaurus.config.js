module.exports = {
  title: 'Reveal docs',
  tagline: '@cognite/reveal documentation site',
  url: 'https://cognitedata.github.io',
  baseUrl: '/reveal-docs/',
  favicon: 'img/favicon.ico',
  organizationName: 'cognitedata',
  projectName: 'reveal',
  themeConfig: {
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
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/cognitedata/reveal/blob/master/documentation',
          remarkPlugins: [
            require('./src/plugins/remark-npm2yarn'),
            require('./src/plugins/remark-runnable-reveal-demo'),
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: ['docusaurus2-dotenv']
};
