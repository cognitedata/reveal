import { Sequence } from '@cognite/sdk';

// TODO(DE-135) Clean up shared resources
export const sequences: Sequence[] = [
  ({
    id: 18829367093500,
    name: 'LubeOil_65-CT-510',
    externalId: 'LubeOil_65-CT-510',
    metadata: {},
    columns: [
      {
        externalId: 'Oil_unit_description',
        description: 'Unit',
        valueType: 'STRING',
        metadata: {},
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      },
      {
        externalId: 'Oil_sampling_point',
        valueType: 'STRING',
        metadata: {},
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      },
      {
        externalId: 'Oil_ressursnummer',
        valueType: 'STRING',
        metadata: {},
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      },
      {
        externalId: 'Oil_qty',
        valueType: 'STRING',
        metadata: {},
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      },
      {
        externalId: 'Oil_type',
        valueType: 'STRING',
        metadata: {},
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      },
      {
        externalId: 'Oil_comments',
        valueType: 'STRING',
        metadata: {},
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      },
      {
        externalId: 'Oil_change_frequence',
        valueType: 'STRING',
        metadata: {},
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      },
      {
        externalId: 'Oil_annual_consumption',
        valueType: 'STRING',
        metadata: {},
        createdTime: new Date(),
        lastUpdatedTime: new Date(),
      },
    ],
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  } as unknown) as Sequence,
];
