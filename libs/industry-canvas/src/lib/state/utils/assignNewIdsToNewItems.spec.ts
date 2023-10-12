import { ContainerType } from '@cognite/unified-file-viewer';

import type { RuleType } from '../../components/ContextualTooltips/AssetTooltip/types';
import type { CanvasNode, IndustryCanvasState } from '../../types';

import assignNewIdsToNewItems, {
  mapOldIdsToNewIds,
} from './assignNewIdsToNewItems';

describe('mapOldIdsToNewIds', () => {
  it('should correctly map old IDs to new IDs', () => {
    expect(
      mapOldIdsToNewIds(
        {
          oldId1_foo: 'value1',
          oldId2_bar: 'value2',
        },
        new Map([
          ['oldId1', 'newId1'],
          ['oldId2', 'newId2'],
        ])
      )
    ).toEqual({
      newId1_foo: 'value1',
      newId2_bar: 'value2',
    });
  });

  it('should handle cases where there are no new IDs', () => {
    // The result should be the same as the input data since there are no new IDs to map.
    expect({
      oldId1_key: 'value1',
      oldId2_key: 'value2',
    }).toEqual({
      oldId1_key: 'value1',
      oldId2_key: 'value2',
    });
  });
});

describe('assignNewIdsToNewItems', () => {
  it('should correctly assign new IDs to new items', () => {
    const state: IndustryCanvasState = {
      nodes: [{ id: 'oldId' }, { id: 'foo' }] as CanvasNode[],
      filters: [
        {
          containerId: 'oldId',
          appliesToContainerType: ContainerType.DOCUMENT,
          properties: [],
        },
        {
          containerId: 'foo',
          appliesToContainerType: ContainerType.IMAGE,
          properties: [],
        },
      ],
      pinnedTimeseriesIdsByAnnotationId: {
        oldId_annotationId1: [1, 2],
        foo_annotationId2: [3, 4],
      },
      liveSensorRulesByAnnotationIdByTimeseriesId: {
        oldId_annotationId1: {
          1: [{ id: 'rule1' } as RuleType],
          2: [{ id: 'rule2' } as RuleType],
        },
        foo_annotationId2: {
          3: [{ id: 'rule3' } as RuleType],
          4: [{ id: 'rule4' } as RuleType],
        },
      },
    };
    const newIdByOldId = new Map([['oldId', 'newId']]);
    const result = assignNewIdsToNewItems(state, newIdByOldId);
    expect(result).toEqual({
      nodes: [{ id: 'newId' }, { id: 'foo' }],
      filters: [
        {
          containerId: 'newId',
          appliesToContainerType: ContainerType.DOCUMENT,
          properties: [],
        },
        {
          containerId: 'foo',
          appliesToContainerType: ContainerType.IMAGE,
          properties: [],
        },
      ],
      pinnedTimeseriesIdsByAnnotationId: {
        newId_annotationId1: [1, 2],
        foo_annotationId2: [3, 4],
      },
      liveSensorRulesByAnnotationIdByTimeseriesId: {
        newId_annotationId1: { 1: [{ id: 'rule1' }], 2: [{ id: 'rule2' }] },
        foo_annotationId2: { 3: [{ id: 'rule3' }], 4: [{ id: 'rule4' }] },
      },
    });
  });

  it('should handle cases where there are no new IDs', () => {
    const state: IndustryCanvasState = {
      nodes: [{ id: 'oldId1' } as CanvasNode],
      filters: [],
      pinnedTimeseriesIdsByAnnotationId: {},
      liveSensorRulesByAnnotationIdByTimeseriesId: {},
    };
    // The result should be the same as the input state since there are no new IDs to assign.
    expect(assignNewIdsToNewItems(state, new Map())).toEqual(state);
  });
});
