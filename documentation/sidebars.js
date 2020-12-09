module.exports = {
  docs: [
    {
      type: 'doc',
      id: 'overview',
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
        'examples/cad-transform-override',
        'examples/cad-ghostmode',
        'examples/cad-2doverlay',
        'examples/cad-3dobjects',
        'examples/node-visiting',
        'examples/cad-nodefiltering',
        'examples/cad-preview',
        'examples/clipping',
        'examples/pointcloud',
        'examples/pointcloud-intersections',
        'examples/antialiasing',
      ],
    },
    {
      type: 'doc',
      id: 'concepts',
    },
    {
      type: 'doc',
      id: 'API Reference' /* must be generated before start or build */,
    },
    {
      type: 'link',
      href: 'https://github.com/cognitedata/reveal/releases',
      label: 'Release notes',
    },
  ],
};
