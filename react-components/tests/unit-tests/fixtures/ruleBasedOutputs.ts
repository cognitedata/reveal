import { Asset } from "@cognite/sdk/dist/src";
import { TriggerTypeData, FdmTyping } from "../../../src/components/RuleBasedOutputs/types";

export const triggerTypeData1: TriggerTypeData[] = [
    {
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
    },
    {
      type: 'metadata',
      asset: {
        metadata: {
          key1: 'value1',
          key2: 'value2'
        }
      } as unknown as Asset
    },
    {
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
    }
  ];


  export const triggerTypeData2: TriggerTypeData[] = [
    {
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
    },
    {
      type: 'metadata',
      asset: {
        metadata: {
          key1: 'value1',
          key2: 'value2'
        }
      } as unknown as Asset
    },
    {
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
    }
  ];
