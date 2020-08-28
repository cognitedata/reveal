module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'overview'
    },
    {
      type: 'doc',
      id: 'getting-started'
    },
    {
      type: 'doc',
      id: 'installation',
    },
    {
      type: 'doc',
      id: 'migration-guide',
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
      id: 'API Reference' /* must be generated before start or build */
    },
  ],
};
