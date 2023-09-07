import { ContainerType } from '@cognite/unified-file-viewer';

import {
  AssetContainerConfig,
  EventContainerConfigTypeAB1,
  EventContainerConfigTypeCUndefinedSubType,
} from '../../state/utils/__mock__/data';
import { Filter } from '../../types';

import findApplicableContainerConfigFilter from './findApplicableContainerConfigFilter';

describe('findApplicableContainerConfigFilter', () => {
  it('should return undefined if no match was found', () => {
    const filters = [
      {
        appliesToContainerType: ContainerType.EVENT,
        containerId: 'no-match',
        properties: ['red'],
      },
      {
        appliesToContainerType: ContainerType.ASSET,
        containerId: AssetContainerConfig.id,
        properties: ['green'],
      },
    ];

    const filter = findApplicableContainerConfigFilter(
      EventContainerConfigTypeAB1,
      filters
    );

    expect(filter).toEqual(undefined);
  });

  it('should return a filter if a matching specific filter was found', () => {
    const filters = [
      {
        appliesToContainerType: ContainerType.EVENT,
        containerId: EventContainerConfigTypeAB1.id,
        properties: ['red'],
      },
    ];

    const filter = findApplicableContainerConfigFilter(
      EventContainerConfigTypeAB1,
      filters
    );

    expect(filter).toEqual(filters[0]);
  });

  it('should return the last applicable matching filter for asset filters', () => {
    const filters = [
      {
        appliesToContainerType: ContainerType.ASSET,
        containerId: AssetContainerConfig.id,
        properties: ['orange'],
      },
      {
        appliesToContainerType: ContainerType.ASSET,
        properties: ['red'],
      },
    ];

    const filter = findApplicableContainerConfigFilter(
      AssetContainerConfig,
      filters
    );

    expect(filter).toEqual(filters[1]);
  });

  it('should correctly match filters with undefined subType', () => {
    const filter = {
      appliesToContainerType: ContainerType.EVENT,
      appliesWhen: [
        {
          valueAtPath: 'metadata.type',
          isEqualTo: 'b',
        },
        {
          valueAtPath: 'metadata.subtype',
          isEqualTo: undefined,
        },
      ],
      properties: ['property-path'],
    };

    expect(
      findApplicableContainerConfigFilter(
        EventContainerConfigTypeCUndefinedSubType,
        [filter]
      )
    ).toEqual(filter);
  });

  it('should return the last applicable filter if a matching generic event filter was found with the same type and subtype', () => {
    const filters = [
      {
        appliesToContainerType: ContainerType.EVENT,
        containerId: EventContainerConfigTypeAB1.id,
        appliesWhen: [
          {
            valueAtPath: 'metadata.type',
            isEqualTo: 'a',
          },
          {
            valueAtPath: 'metadata.subtype',
            isEqualTo: 'b',
          },
        ],
        properties: ['orange'],
      },
      {
        appliesToContainerType: ContainerType.EVENT,
        appliesWhen: [
          {
            valueAtPath: 'metadata.type',
            isEqualTo: 'b',
          },
          {
            valueAtPath: 'metadata.subtype',
            isEqualTo: 'b',
          },
        ],
        properties: ['purple'],
      },
      {
        appliesToContainerType: ContainerType.EVENT,
        appliesWhen: [
          {
            valueAtPath: 'metadata.type',
            isEqualTo: 'a',
          },
          {
            valueAtPath: 'metadata.subtype',
            isEqualTo: 'b',
          },
        ],
        properties: ['red'],
      },
    ];
    const filter = findApplicableContainerConfigFilter(
      EventContainerConfigTypeAB1,
      filters
    );

    expect(filter).toEqual(filters[2]);
  });
});
