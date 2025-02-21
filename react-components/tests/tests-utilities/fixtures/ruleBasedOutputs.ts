import { type AssetMapping3D, type Datapoints, type Asset } from '@cognite/sdk/';
import {
  type TriggerTypeData,
  type FdmTyping,
  type ColorRuleOutput,
  Expression,
  FdmInstanceNodeWithConnectionAndProperties
} from '../../../src/components/RuleBasedOutputs/types';
import { type AssetIdsAndTimeseries } from '../../../src/data-providers/types';

const triggerDataFDMBoolean: TriggerTypeData = {
  type: 'fdm',
  instanceNode: {
    items: [
      {
        instanceType: 'node',
        version: 1,
        space: 'space-1',
        externalId: 'externalId-2-boolean',
        createdTime: 1212121212,
        lastUpdatedTime: 1212121212,
        properties: {
          'space-1': {
            'externalId-2/1': { mockedProperty: true }
          }
        }
      }
    ],
    instanceType: 'node',
    version: 0,
    space: 'space-1',
    externalId: 'externalId-2-boolean',
    createdTime: 0,
    lastUpdatedTime: 0,
    deletedTime: 0,
    typing: {} satisfies FdmTyping
  }
};

const triggerDataMetadata: TriggerTypeData = {
  type: 'metadata',
  asset: {
    metadata: {
      key1: 'value1',
      key2: 'value2'
    }
  } as unknown as Asset
};

const triggerDataFdmNumeric: TriggerTypeData = {
  type: 'fdm',
  instanceNode: {
    items: [
      {
        instanceType: 'node',
        version: 1,
        space: 'space-1',
        externalId: 'externalId-1',
        createdTime: 1212121212,
        lastUpdatedTime: 1212121212,
        properties: {
          'space-1': {
            'externalId-1/1': { mockedProperty: 42 }
          }
        }
      }
    ],
    instanceType: 'node',
    version: 0,
    space: '',
    externalId: '',
    createdTime: 0,
    lastUpdatedTime: 0,
    deletedTime: 0,
    typing: {} satisfies FdmTyping
  }
};

const triggerDataTimeseries: TriggerTypeData = {
  type: 'timeseries',
  timeseries: {
    timeseriesWithDatapoints: [
      {
        externalId: 'timeseries-1',
        id: 123,
        isString: false,
        isStep: false,
        description: 'description',
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
        datapoints: [
          {
            value: 55,
            timestamp: new Date()
          },
          {
            value: 60,
            timestamp: new Date()
          },
          {
            value: 65,
            timestamp: new Date()
          },
          {
            value: 70,
            timestamp: new Date()
          },
          {
            value: 75,
            timestamp: new Date()
          },
          {
            value: 80,
            timestamp: new Date()
          },
          {
            value: 85,
            timestamp: new Date()
          },
          {
            value: 90,
            timestamp: new Date()
          },
          {
            value: 95,
            timestamp: new Date()
          },
          {
            value: 100,
            timestamp: new Date()
          }
        ]
      }
    ],
    linkedAssets: {
      rootId: 1,
      name: 'asset-1',
      id: 1,
      lastUpdatedTime: 1212121212,
      createdTime: 1212121212
    } as unknown as Asset
  }
};

const triggerDataFdmDatetime: TriggerTypeData = {
  type: 'fdm',
  instanceNode: {
    items: [
      {
        instanceType: 'node',
        version: 1,
        space: 'space-1',
        externalId: 'externalId-1',
        createdTime: 1212121212,
        lastUpdatedTime: 1212121212,
        properties: {
          'space-1': {
            'externalId-1/1': { mockedProperty: '2025-02-19T12:00:00Z' }
          }
        }
      }
    ],
    instanceType: 'node',
    version: 0,
    space: '',
    externalId: '',
    createdTime: 0,
    lastUpdatedTime: 0,
    deletedTime: 0,
    typing: {}
  }
};

export const triggerTypeData1: TriggerTypeData[] = [
  triggerDataFdmNumeric,
  triggerDataMetadata,
  triggerDataTimeseries
];

export const triggerTypeData2: TriggerTypeData[] = [
  triggerDataFDMBoolean,
  triggerDataMetadata,
  triggerDataTimeseries
];

export const triggerTypeData3: TriggerTypeData[] = [
  triggerDataFdmDatetime,
  triggerDataMetadata,
  triggerDataTimeseries
];

export const contextualizedAssetNodes: Asset[] = [
  {
    id: 1,
    name: 'Asset 1',
    rootId: 0,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    metadata: {
      mockedProperty1: 'valueA',
      mockedProperty2: '20'
    }
  },
  {
    id: 2,
    name: 'Asset 2',
    rootId: 0,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
    metadata: {
      mockedProperty1: 'valueB',
      mockedProperty2: '1'
    }
  }
];

export const assetIdsAndTimeseries: AssetIdsAndTimeseries[] = [
  {
    assetIds: { id: 1 },
    timeseries: {
      id: 101,
      externalId: 'timeseries-1',
      name: 'timeseries-1',
      isString: false,
      isStep: false,
      description: 'description',
      lastUpdatedTime: new Date(),
      createdTime: new Date()
    }
  },
  {
    assetIds: { id: 2 },
    timeseries: {
      id: 102,
      externalId: 'timeseries-2',
      name: 'timeseries-2',
      isString: false,
      isStep: false,
      description: 'description',
      lastUpdatedTime: new Date(),
      createdTime: new Date()
    }
  }
];
export const timeseriesDatapoints: Datapoints[] = [
  {
    id: 101,
    externalId: 'timeseries-1',
    datapoints: [{ timestamp: new Date(), value: 42 }],
    isString: false
  },
  {
    id: 102,
    externalId: 'timeseries-2',
    datapoints: [{ timestamp: new Date(), value: 43 }],
    isString: false
  }
];
export const assetMappings: AssetMapping3D[] = [
  {
    assetId: 1,
    treeIndex: 0,
    subtreeSize: 1,
    nodeId: 2
  },
  {
    assetId: 2,
    treeIndex: 1,
    subtreeSize: 1,
    nodeId: 1
  }
];
export const outputSelected: ColorRuleOutput = {
  type: 'color',
  fill: '#ff0000',
  outline: '#000000',
  externalId: 'some-external-id'
};

export const mockedFdmInstanceNodeWithConnectionAndProperties: FdmInstanceNodeWithConnectionAndProperties[] =
  [
    {
      cadNode: {
        treeIndex: 0,
        subtreeSize: 1,
        id: 0,
        parentId: 0,
        depth: 0,
        name: 'node-1'
      },
      connection: {
        instance: { space: 'space-1', externalId: 'externalId-1' },
        modelId: 12121212,
        revisionId: 12121212,
        treeIndex: 0
      },
      instanceType: 'node',
      version: 0,
      space: 'space-1',
      externalId: 'externalId-1',
      createdTime: 0,
      lastUpdatedTime: 0,
      deletedTime: 0,
      items: [
        {
          instanceType: 'node',
          version: 1,
          space: 'space-1',
          externalId: 'externalId-1',
          createdTime: 1212121212,
          lastUpdatedTime: 1212121212,
          properties: {
            'space-1': {
              'externalId-property/1': { mockedProperty: true }
            }
          }
        }
      ],
      typing: {}
    } satisfies FdmInstanceNodeWithConnectionAndProperties,
    {
      cadNode: {
        treeIndex: 1,
        subtreeSize: 1,
        id: 1,
        parentId: 0,
        depth: 0,
        name: 'node-2'
      },
      connection: {
        instance: { space: 'space-2', externalId: 'externalId-2' },
        modelId: 12121212,
        revisionId: 12121212,
        treeIndex: 1
      },
      instanceType: 'node',
      version: 0,
      space: 'space-2',
      externalId: 'externalId-2',
      createdTime: 0,
      lastUpdatedTime: 0,
      deletedTime: 0,
      items: [
        {
          instanceType: 'node',
          version: 1,
          space: 'space-2',
          externalId: 'externalId-2',
          createdTime: 1212121212,
          lastUpdatedTime: 1212121212,
          properties: {
            'space-1': {
              'externalId-property/1': { mockedProperty: false }
            }
          }
        }
      ],
      typing: {}
    } satisfies FdmInstanceNodeWithConnectionAndProperties
  ];
export const mockedExpressionFdmMappingBoolean: Expression = {
  type: 'booleanExpression',
  condition: {
    type: 'equals',
    parameter: false
  },
  trigger: {
    type: 'fdm',
    key: {
      property: 'mockedProperty',
      space: 'space-1',
      externalId: 'externalId-1',
      view: {
        type: 'view',
        version: '1',
        space: 'space-1',
        externalId: 'externalId-property'
      },
      typing: {}
    }
  }
};

export const mockedTreeNodes: AssetMapping3D[] = [
  {
    assetId: 1,
    treeIndex: 0,
    subtreeSize: 1,
    nodeId: 0
  } satisfies AssetMapping3D,
  {
    assetId: 2,
    treeIndex: 1,
    subtreeSize: 1,
    nodeId: 0
  } satisfies AssetMapping3D
];
