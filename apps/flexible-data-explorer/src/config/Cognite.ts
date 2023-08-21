import { Matrix4 } from 'three';

import { ProjectConfig } from './types';

export const cogniteConfig: ProjectConfig[] = [
  {
    project: 'dss-dev',
    // NOTE: Configured this project with empty site and data models because we want to show a three d model,
    // but also able to switch between data models. (will be fixed when we implement 3D model selection in the UI)

    site: ' ',
    // dataModels: [
    //   {
    //     externalId: 'MovieDM',
    //     space: 'deep',
    //     version: '4',
    //   },
    //   {
    //     externalId: 'AdvancedJoins',
    //     space: 'AdvancedJoins',
    //     version: '3',
    //   },
    // ],

    // fileConfig: {
    //   dataSetIds: [
    //     8790386435534646 /* test */,
    //     2380258309190866 /* best_day_demo_deviation_events */,
    //   ],
    // },
    // timeseriesConfig: {
    //   dataSetIds: [3736355216889108 /* infield-measurement-timeseries */],
    // },

    threeDResources: [
      {
        modelId: 5365953234046511,
        revisionId: 8757902535696137,
      },
    ],
  },
  {
    project: 'lervik-industries',
    site: ' ',

    threeDResources: [
      {
        modelId: 7848789582129513,
        revisionId: 1871031176419082,
        transform: new Matrix4().makeScale(0.01, 0.01, 0.01),
      },
    ],
  },
  {
    project: '3d-test',
    site: 'My Site',
    description: 'Test site for 3D visualization.',

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
