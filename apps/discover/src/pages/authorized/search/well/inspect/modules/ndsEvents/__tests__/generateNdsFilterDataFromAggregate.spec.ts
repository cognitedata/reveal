import { NdsAggregate } from '@cognite/sdk-wells-v3/dist/src';

import { generateNdsFilterDataFromAggregate } from '../utils/generateNdsFilterDataFromAggregate';

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
        label: 'Type 1',
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
        label: 'ORPHAN_SUBTYPES',
        value: 'ORPHAN_SUBTYPES',
        options: [
          {
            label: 'SubType 3',
            value: 'SubType 3',
          },
        ],
      },
      {
        label: 'Type 3',
        value: 'Type 3',
        options: [],
      },
    ];
    const result = generateNdsFilterDataFromAggregate(ndsAggregateMock);
    expect(result).toEqual(filterResult);
  });
});
