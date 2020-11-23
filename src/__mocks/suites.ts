export const getMockResponse = () => [
  {
    key: 'row-3',
    columns: {
      title: 'Operations',
      color: '#FFE1D1',
      dashboards: [
        {
          key: 'row-3-grafana-1',
          type: 'grafana',
          title: 'NFA compressor upset condition',
          url: '',
        },
        {
          key: 'row-3-powerbi-2',
          type: 'powebpi',
          title: 'Status Change Alert',
          url: '',
        },
      ],
    },
    lastUpdatedTime: 1605817736337,
  },
  {
    key: 'row-1',
    columns: {
      title: 'Production Optimization',
      visibleTo: [
        'dc-team-operations',
        'dc-management-team',
        'dc-team-developers',
      ],
      color: '#F4DAF8',
      dashboards: [
        {
          key: 'grafana-1',
          type: 'grafana',
          title: 'Humidity',
          embedTag:
            '<iframe src="https://grafana-krm.cognite.ai/d-solo/2ThOJpDGk/hpu-dashboard?orgId=2&from=1604909959865&to=1605514759865&theme=light&panelId=2" width="300" height="184" frameborder="0"></iframe>',
          url:
            'https://grafana-krm.cognite.ai/d/2ThOJpDGk/hpu-dashboard?viewPanel=2&orgId=2',
        },
        {
          key: 'grafana-2',
          type: 'grafana',
          title: 'Reservoir Temperature',
          embedTag:
            '<iframe src="https://grafana-krm.cognite.ai/d-solo/2ThOJpDGk/hpu-dashboard?orgId=2&from=1604909959865&to=1605514759865&theme=light&panelId=4" width="450" height="200" frameborder="0"></iframe>',
          url:
            'https://grafana-krm.cognite.ai/d/2ThOJpDGk/hpu-dashboard?viewPanel=4&orgId=2',
          visibleTo: ['dc-team-developers'],
        },
        {
          key: 'grafana-3',
          type: 'grafana',
          title: 'Conductivity Rate of Change',
          url:
            'https://grafana-krm.cognite.ai/d/2ThOJpDGk/hpu-dashboard?viewPanel=6&orgId=2',
          embedTag:
            '<iframe src="https://grafana-krm.cognite.ai/d-solo/2ThOJpDGk/hpu-dashboard?orgId=2&from=1604909959865&to=1605514759865&theme=light&panelId=6" width="450" height="200" frameborder="0"></iframe>',
          visibleTo: ['dc-management-team'],
        },
      ],
    },
    lastUpdatedTime: 1605817736352,
  },
  {
    key: 'row-2',
    columns: {
      title: 'Asset Performance & Integrity',
      color: '#D3F7FB',
      dashboards: [
        {
          key: 'powerbi-1',
          type: 'powerbi',
          title: 'Sample title',
          url: 'https://powerbi.microsoft.com/en-us/',
        },
      ],
    },
    lastUpdatedTime: 1605817736332,
  },
];
