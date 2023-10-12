import { ContainerType } from '@cognite/unified-file-viewer';

import {
  EventContainerConfigTypeAB1,
  EventContainerConfigTypeBB1,
  EventContainerConfigTypeCUndefinedSubType,
} from './__mock__/data';
import applyEventFilters from './applyEventFilters';

describe('applyEventFilters', () => {
  it('should not apply event filters if there are no event containers', () => {
    expect(applyEventFilters([], ['property-path'], true)([])).toEqual([]);
  });

  describe('generic event filters', () => {
    it('should apply generic event filters if shouldApplyToAll is passed', () => {
      expect(
        applyEventFilters(
          [EventContainerConfigTypeBB1],
          ['property-path'],
          true
        )([])
      ).toEqual([
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
          properties: ['property-path'],
        },
      ]);
    });

    it('should correctly apply generic event filters with undefined subtype', () => {
      expect(
        applyEventFilters(
          [EventContainerConfigTypeCUndefinedSubType],
          ['property-path'],
          true
        )([])
      ).toEqual([
        {
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
        },
      ]);
    });

    it('should override specific event filters for a specific type and subtype', () => {
      const existingFilterForOtherType = {
        appliesToContainerType: ContainerType.EVENT,
        properties: ['property-path-123'],
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
      };

      const existingSpecificFilter = {
        appliesToContainerType: ContainerType.EVENT,
        containerId: 'event-container-id-ab1',
        properties: ['property-path-456'],
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
      };

      expect(
        applyEventFilters(
          [EventContainerConfigTypeAB1],
          ['property-path-789'],
          true
        )([existingFilterForOtherType, existingSpecificFilter])
      ).toEqual([
        existingFilterForOtherType,
        {
          appliesToContainerType: ContainerType.EVENT,
          properties: ['property-path-789'],
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
        },
      ]);
    });

    describe('specific event filters', () => {
      it('should apply specific event filters for each event container', () => {
        expect(
          applyEventFilters(
            [EventContainerConfigTypeAB1, EventContainerConfigTypeBB1],
            ['property-path', 'property-path-2'],
            false
          )([])
        ).toEqual([
          {
            appliesToContainerType: ContainerType.EVENT,
            containerId: 'event-container-id-ab1',
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
            properties: ['property-path', 'property-path-2'],
          },
          {
            appliesToContainerType: ContainerType.EVENT,
            containerId: 'event-container-id-bb1',
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
            properties: ['property-path', 'property-path-2'],
          },
        ]);
      });

      it('should not override other specific event filters of the same type', () => {
        expect(
          applyEventFilters(
            [EventContainerConfigTypeAB1],
            ['property-path', 'property-path-2'],
            false
          )([
            {
              appliesToContainerType: ContainerType.EVENT,
              containerId: 'event-container-id-ab1',
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
              properties: ['property-path-3'],
            },
            {
              appliesToContainerType: ContainerType.EVENT,
              containerId: 'event-container-id-bb1',
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
              properties: ['property-path-4'],
            },
          ])
        ).toEqual([
          {
            appliesToContainerType: ContainerType.EVENT,
            containerId: 'event-container-id-bb1',
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
            properties: ['property-path-4'],
          },
          {
            appliesToContainerType: ContainerType.EVENT,
            containerId: 'event-container-id-ab1',
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
            properties: ['property-path', 'property-path-2'],
          },
        ]);
      });
    });
  });
});
