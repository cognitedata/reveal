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
      items: [
        'examples/cad-basic', 
        'examples/cad-colors', 
        'examples/cad-highlighting', 
        'examples/cad-2doverlay',
        'examples/cad-preview',
      ],
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
