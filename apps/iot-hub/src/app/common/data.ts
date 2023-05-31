import { IoTDevice } from './types';

export const devices: IoTDevice[] = [
  {
    // Make this the same as ext pipeline id!
    id: '3576',
    name: 'London Edge',
    latestResponse: '2021-09-01T12:00:00Z',
    modules: [
      {
        name: '$edgeAgent',
        type: 'builtin',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: '$edgeHub',
        type: 'builtin',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: 'grafana',
        type: 'custom',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: 'opcua-extractor',
        type: 'extractor',
        deployed: true,
        reported: true,
        status: true,
      },
    ],
  },
  {
    // Make this the same as ext pipeline id!
    id: '3578',
    name: 'London Edge 2',
    latestResponse: '2023-05-01T12:00:00Z',
    modules: [
      {
        name: '$edgeAgent',
        type: 'builtin',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: '$edgeHub',
        type: 'builtin',
        deployed: true,
        reported: true,
        status: true,
      },
      {
        name: 'opcua-extractor',
        type: 'extractor',
        deployed: true,
        reported: true,
        status: true,
      },
    ],
  },
];
