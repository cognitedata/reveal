export const suites = {
  items: [
    {
      key: 'row-1',
      columns: {
        title: 'Production Optimization',
        color: '#F4DAF8',
        boards: [
          {
            key: 'grafana-1',
            type: 'grafana',
            title: 'Humidity',
            embedTag: `<iframe src="https://grafana-krm.cognite.ai/d-solo/2ThOJpDGk/hpu-dashboard?orgId=2&from=1604909959865&to=1605514759865&theme=light&panelId=2" width="300" height="184" frameborder="0"></iframe>`,
          },
          {
            key: 'grafana-2',
            type: 'grafana',
            title: 'Reservoir Temperature',
            embedTag: `<iframe src="https://grafana-krm.cognite.ai/d-solo/2ThOJpDGk/hpu-dashboard?orgId=2&from=1604909959865&to=1605514759865&theme=light&panelId=4" width="450" height="200" frameborder="0"></iframe>`,
          },
          {
            key: 'grafana-3',
            type: 'grafana',
            title: 'Conductivity Rate of Change',
            embedTag: `<iframe src="https://grafana-krm.cognite.ai/d-solo/2ThOJpDGk/hpu-dashboard?orgId=2&from=1604909959865&to=1605514759865&theme=light&panelId=6" width="450" height="200" frameborder="0"></iframe>`,
          },
        ],
      },
      lastUpdatedTime: 1604509799577,
    },
    {
      key: 'row-2',
      columns: {
        title: 'Asset Performance & Integrity',
        color: '#D3F7FB',
        boards: [
          {
            key: 'grafana-2',
            type: 'grafana',
            title: 'Field Preformance per location',
          },
        ],
      },
      lastUpdatedTime: 1604509799577,
    },
    {
      key: 'row-3',
      columns: {
        title: 'Operations',
        color: '#FFE1D1',
        boards: [
          {
            key: 'grafana-3',
            type: 'grafana',
            title: 'NFA compressor upset condition',
          },
          {
            key: 'powerbi-3',
            type: 'powebpi',
            title: 'Status Change Alert',
          },
        ],
      },
      lastUpdatedTime: 1604509799577,
    },
  ],
};
