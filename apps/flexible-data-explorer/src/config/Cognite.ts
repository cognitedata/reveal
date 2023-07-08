import { Matrix4 } from 'three';

import { ProjectConfig } from './types';

export const cogniteConfig: ProjectConfig[] = [
  {
    project: 'dss-dev',
    site: 'Akerkvartalet',
    description:
      'All the data from the offices in Oslo is consolidated within this area.',

    dataModels: [
      {
        name: 'MovieDM',
        space: 'deep',
        version: '4',
      },
      {
        name: 'IndustryCanvas',
        space: 'IndustryCanvas',
        version: '2',
      },
    ],

    fileConfig: {
      dataSetIds: [
        8790386435534646 /* test */,
        2380258309190866 /* best_day_demo_deviation_events */,
      ],
    },
    timeseriesConfig: {
      dataSetIds: [3736355216889108 /* infield-measurement-timeseries */],
    },
  },
  {
    project: '3d-test',
    site: 'My Site',
    description: 'Test site for 3D visualization.',

    dataModels: [],
    threeDResources: [
      {
        modelId: 1791160622840317,
        revisionId: 498427137020189,
      },
      {
        modelId: 1791160622840317,
        revisionId: 502149125550840,
        transform: new Matrix4().makeTranslation(0, 10, 0),
      },
      {
        siteId: 'c_RC_2',
      },
      {
        modelId: 3865289545346058,
        revisionId: 4160448151596909,
      },
    ],
  },
];
