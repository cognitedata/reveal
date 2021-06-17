import { Suite } from 'store/suites/types';

export const getSuiteWithImages = (key = 'test-suite-with-images') => ({
  key,
  title: 'Test suite with images',
  color: '#FFE1D1',
  description: '',
  order: 0,
  boards: [
    {
      key: `${key}-grafana-1`,
      type: 'grafana',
      title: 'Test grafana suite',
      url: 'http://example.url',
      imageFileId: `dc_preview_${key}-grafana-1`,
    },
    {
      key: `${key}-powerbi-2`,
      type: 'powebpi',
      title: 'Test PowerBI suite',
      url: 'http://example-2.url',
      imageFileId: `dc_preview_${key}-powerbi-2`,
    },
  ],
});

export const getSuiteWithEmbedTags = (
  key = 'test-suite-with-embedded-tags'
) => ({
  key,
  title: 'Test suite with embeded tags',
  color: '#FFE1D1',
  description: '',
  order: 1,
  boards: [
    {
      key: `${key}-grafana-1`,
      type: 'grafana',
      title: 'Test grafana suite',
      url: 'http://example.url',
      embedTag: `<iframe src="https://grafana/abcdefgh" width="450" height="200" frameborder="0"></iframe>`,
      imageFileId: '',
    },
    {
      key: `${key}-powerbi-2`,
      type: 'powebpi',
      title: 'Test PowerBI suite',
      url: 'http://example-2.url',
      embedTag:
        '<iframe width="1140" height="541.25" src="https://powerbi/abcdefgh" frameborder="0"></iframe>',
      imageFileId: '',
    },
  ],
});

export const getEmptySuite = (key = 'test-empty-suite') => ({
  key,
  title: 'Test empty syite',
  color: '#FFE1D1',
  description: '',
  order: 3,
  boards: [],
});

export const getSuites = () =>
  [
    {
      key: 'suite-3',
      title: 'Operations',
      color: '#FFE1D1',
      description: '',
      order: 4,
      boards: [
        {
          key: 'suite-3-grafana-1',
          type: 'grafana',
          title: 'NFA compressor upset condition',
          url: '',
          imageFileId: 'dc_preview_suite-3-grafana-1',
        },
        {
          key: 'suite-3-powerbi-2',
          type: 'powebpi',
          title: 'Status Change Alert',
          url: '',
          imageFileId: 'dc_preview_suite-3-powerbi-2',
        },
      ],
    },
    {
      key: 'suite-1',
      title: 'Production Optimization',
      visibleTo: [
        'dc-team-operations',
        'dc-management-team',
        'dc-team-developers',
      ],
      color: '#F4DAF8',
      description: '',
      order: 5,
      boards: [
        {
          key: 'grafana-1',
          type: 'grafana',
          title: 'Humidity',
          embedTag:
            '<iframe src="https://grafana/abcdefgh" width="300" height="184" frameborder="0"></iframe>',
          url: 'https://abcdefgh?viewPanel=2&orgId=2',
          imageFileId: '',
        },
        {
          key: 'grafana-2',
          type: 'grafana',
          title: 'Reservoir Temperature',
          embedTag:
            '<iframe src="https://grafana/abcdefgh" width="450" height="200" frameborder="0"></iframe>',
          url: 'https://abcdefgh?viewPanel=4&orgId=2',
          visibleTo: ['dc-team-developers'],
          imageFileId: '',
        },
        {
          key: 'grafana-3',
          type: 'grafana',
          title: 'Conductivity Rate of Change',
          url: 'https://abcdefgh?viewPanel=6&orgId=2',
          embedTag:
            '<iframe src="https://grafana/abcdefgh" width="450" height="200" frameborder="0"></iframe>',
          visibleTo: ['dc-management-team'],
          imageFileId: '',
        },
      ],
    },
    {
      key: 'suite-2',
      title: 'Asset Performance & Integrity',
      color: '#D3F7FB',
      description: '',
      order: 6,
      boards: [
        {
          key: 'powerbi-1',
          type: 'powerbi',
          title: 'Sample title',
          url: 'https://powerbi.microsoft.com/en-us/',
          imageFileId: '',
        },
      ],
    },
  ] as Suite[];
