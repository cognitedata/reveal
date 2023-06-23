import { ProjectConfig } from './types';

export const celaneseConfig: ProjectConfig[] = [
  {
    site: 'Clear Lake',
    imageUrl:
      'https://clui.org/sites/default/files/styles/presentation_medium/public/ludb/tx/7826/5663083259_14da9bed95_o.jpg',
    project: 'celanese',

    dataModels: [
      {
        name: 'Asset',
        space: 'xyz',
        version: '1.0.0',
      },
    ],
    nodeSpaces: ['xyz'],
    fileConfig: {
      dataSetIds: ['xyz'],
    },
  },
  // Duplicating for now...
  {
    site: 'Clear Lake',
    imageUrl:
      'https://clui.org/sites/default/files/styles/presentation_medium/public/ludb/tx/7826/5663083259_14da9bed95_o.jpg',
    project: 'celanese-stg',

    dataModels: [],
    nodeSpaces: [],
    fileConfig: {
      dataSetIds: ['xyz'],
    },
  },
];
