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
        {
          "Styling CAD models": [
            'examples/cad-styling',
            'examples/cad-styling-assets',
            'examples/cad-styling-nodes',
            'examples/cad-styling-custom',
          ]
        },
        'examples/cad-prioritized-nodes',
        'examples/cad-transform-override',
        'examples/cad-2doverlay',
        'examples/cad-3dobjects',
        'examples/node-visiting',
        'examples/cad-preview',
        'examples/clipping',
        'examples/cad-save-viewerstate',
        'examples/pointcloud',
        'examples/click-reactions-cad',
        'examples/click-reactions-pointcloud',
        'examples/antialiasing',
        'examples/cad-explode',
        'examples/axisviewtool',
        'examples/geomaptool',
        'examples/timelinetool',
        'examples/combine-models',
        'examples/controlsmodes',
      ],
    },
    {
      type: 'doc',
      id: 'concepts',
    },
    {
      type: 'category',
      label: 'Extending Reveal',
      collapsed: false,
      items: [
        'extending/datasource',
        'extending/camera-manager'
      ],
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
