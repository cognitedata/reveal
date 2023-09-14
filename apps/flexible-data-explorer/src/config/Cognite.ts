import { Matrix4 } from 'three';

import { ProjectConfig } from './types';

export const cogniteConfig: ProjectConfig[] = [
  {
    project: 'dss-dev',
    company: 'Cognite',

    showCustomSite: true,

    // NOTE: Configured this project with empty site and data models because we want to show a three d model,
    // but also able to switch between data models. (will be fixed when we implement 3D model selection in the UI)

    sites: [
      {
        name: 'Fornebu',

        threeDResources: [
          {
            modelId: 5365953234046511,
            revisionId: 8757902535696137,
          },
        ],
      },
    ],
  },
  {
    project: 'lervik-industries',
    company: 'Cognite',

    showCustomSite: true,

    sites: [
      {
        name: 'Fornebu',
        dataModels: [
          {
            externalId: 'ApmSimple',
            space: 'Tutorial_APM_Simple',
            version: '6',
          },
        ],
        threeDResources: [
          {
            modelId: 7848789582129513,
            revisionId: 1871031176419082,
            transform: new Matrix4().makeScale(0.01, 0.01, 0.01),
          },
        ],
      },
      {
        name: 'Austin',
        dataModels: [
          {
            externalId: 'ApmSimple',
            space: 'Tutorial_APM_Simple',
            version: '6',
          },
        ],
        threeDResources: [
          {
            modelId: 7057331773813316,
            revisionId: 7500476061325509,
          },
        ],
      },
    ],
  },
  {
    project: '3d-test',
    company: 'Cognite',
    // description: 'Test site for 3D visualization.',
    showCustomSite: true,

    sites: [
      {
        name: 'My site',
        threeDResources: [
          {
            modelId: 1791160622840317,
            revisionId: 498427137020189,
          },
          {
            modelId: 3282558010084460,
            revisionId: 4932190516335812,
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
    ],
  },
];
