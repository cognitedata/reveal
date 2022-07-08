import { NdsAggregate } from '@cognite/sdk-wells/dist/src';

import { generateNdsFilterDataFromAggregate } from '../generateNdsFilterDataFromAggregate';

describe('generateNdsFilterDataFromAggregate', () => {
  it('should return empty array for empty data', () => {
    const result = generateNdsFilterDataFromAggregate([]);
    expect(result).toEqual([]);
  });

  it('should return filter data correctly', () => {
    const ndsAggregateMock: NdsAggregate[] = [
      {
        wellboreMatchingId: 'mock-id',
        items: [
          {
            riskType: 'Type 1',
            subtype: 'SubType 1',
            count: 1,
          },
          {
            riskType: 'Type 1',
            subtype: 'SubType 2',
            count: 1,
          },
          {
            subtype: 'SubType 3',
            count: 1,
          },
          {
            riskType: 'Type 3',
            count: 1,
          },
        ],
      },
    ];

    const filterResult = [
      {
        category: 'Type 1',
        value: 'Type 1',
        options: [
          {
            label: 'SubType 1',
            value: 'SubType 1',
          },
          {
            label: 'SubType 2',
            value: 'SubType 2',
          },
        ],
      },
      {
        category: 'ORPHAN_SUBTYPES',
        value: 'ORPHAN_SUBTYPES',
        options: [
          {
            label: 'SubType 3',
            value: 'SubType 3',
          },
        ],
      },
      {
        category: 'Type 3',
        value: 'Type 3',
        options: undefined,
      },
    ];
    const result = generateNdsFilterDataFromAggregate(ndsAggregateMock);
    expect(result).toEqual(filterResult);
  });
});
