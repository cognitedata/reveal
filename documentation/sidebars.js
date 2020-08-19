module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['overview', 'installation'],
    },
    {
      type: 'category',
      label: 'Examples',
      collapsed: false,
      items: ['examples/cad-basic', 'examples/cad-colors'],
    },
    {
      type: 'doc',
      id: 'concepts',
    },
    {
      type: 'doc',
      id: 'migration-guide',
    },
    {
      type: 'doc',
      id: 'API Reference' /* must be generated before start or build */
    },
  ],
};
