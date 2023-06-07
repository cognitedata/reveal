/**
 * Cloned
 * https://github.com/cognitedata/data-exploration-components/blob/master/src/domain/transformers.ts
 */

import {
  EventsCollection,
  EventsEntry,
} from '@charts-app/models/event-results/types';

import { CogniteEvent } from '@cognite/sdk';

export const transformNewFilterToOldFilter = <T>(
  filter?: any
): T | undefined => {
  if (filter === undefined) {
    return undefined;
  }

  let updatedFilter = filter;

  if (filter.assetSubtreeIds) {
    updatedFilter = {
      ...filter,
      assetSubtreeIds: filter?.assetSubtreeIds?.map((item: any) => ({
        id: item.id,
      })) as any,
    };
  }

  if (filter.labels) {
    updatedFilter = {
      ...filter,
      labels: {
        containsAny: filter?.labels?.map(({ value }: any) => ({
          externalId: value,
        })),
      },
    };
  }

  return updatedFilter as T;
};

export const isEventSelected = (
  allEventItems: EventsCollection,
  currentEvent: CogniteEvent
) => {
  return allEventItems.find((evt: EventsEntry) => evt.id === currentEvent.id);
};
