import { Asset } from '@cognite/sdk';

export const rootAssets: Asset[] = [
  {
    createdTime: new Date(1649077497698),
    lastUpdatedTime: new Date(1649077497698),
    aggregates: {
      childCount: 4,
    },
    rootId: 4002438896594549,
    externalId: 'LOR_SWEDEN',
    name: 'Sweden',
    metadata: {
      model_id: '7617970672125413',
    },
    id: 4002438896594549,
  },
];

export const assets: Asset[] = [
  {
    createdTime: new Date(1649079372960),
    lastUpdatedTime: new Date(1649079372960),
    rootId: 4002438896594549,
    aggregates: {
      childCount: 0,
    },
    parentId: 4002438896594549,
    parentExternalId: 'LOR_SWEDEN',
    externalId: 'LOR_GATHERING_POINT_D',
    name: 'Gathering point D',
    metadata: {
      'Network Level': '["Facility - Sub-Level - PSH"]',
    },
    source: 'some source',
    id: 354247832298988,
  },
  {
    createdTime: new Date(1649079372960),
    lastUpdatedTime: new Date(1649079372960),
    rootId: 4002438896594549,
    aggregates: {
      childCount: 0,
    },
    parentId: 4002438896594549,
    parentExternalId: 'LOR_SWEDEN',
    externalId: 'LOR_GATHERING_POINT_E',
    name: 'Gathering point E',
    metadata: {
      'Network Level': '["Facility - Sub-Level - PSH"]',
    },
    source: 'some source',
    id: 8026188205449529,
  },
  {
    createdTime: new Date(1649079372960),
    lastUpdatedTime: new Date(1649079372960),
    rootId: 4002438896594549,
    aggregates: {
      childCount: 0,
    },
    parentId: 4002438896594549,
    parentExternalId: 'LOR_SWEDEN',
    externalId: 'LOR_GATHERING_POINT_F',
    name: 'Gathering point F',
    metadata: {
      'Network Level': '["Facility - Sub-Level - PSH"]',
    },
    source: 'some source',
    id: 4731838049650567,
  },
  {
    createdTime: new Date(1649079372960),
    lastUpdatedTime: new Date(1649079372960),
    rootId: 4002438896594549,
    aggregates: {
      childCount: 0,
    },
    parentId: 4068389871948573,
    parentExternalId: 'LOR_UMEA',
    externalId: 'LOR_UMEA_WELL_01',
    name: 'Umea 01',
    metadata: {
      'Network Level': 'well',
    },
    source: 'some other source',
    labels: [
      {
        externalId: 'BEST_DAY_WELL_FLAG_GAS',
      },
      {
        externalId: 'BEST_DAY_NETWORK_LEVEL_WELL',
      },
      {
        externalId: 'BEST_DAY_ARTIFICIAL_LIFT_PUMP',
      },
    ],
    id: 1794699442406418,
  },
  {
    createdTime: new Date(1649079372960),
    lastUpdatedTime: new Date(1649079372960),
    rootId: 4002438896594549,
    aggregates: {
      childCount: 1,
    },
    parentId: 8493722957009725,
    parentExternalId: 'LOR_GOTHENBURG',
    externalId: 'LOR_UMEA',
    name: 'Umea',
    metadata: {},
    source: 'some other source',
    id: 4068389871948573,
  },
  {
    createdTime: new Date(1649079372960),
    lastUpdatedTime: new Date(1649079372960),
    rootId: 4002438896594549,
    aggregates: {
      childCount: 1,
    },
    parentId: 4002438896594549,
    parentExternalId: 'LOR_SWEDEN',
    externalId: 'LOR_GOTHENBURG',
    name: 'Gothenburg',
    metadata: {},
    source: 'some other source',
    id: 8493722957009725,
  },
];
