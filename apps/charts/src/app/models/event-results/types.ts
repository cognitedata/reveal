import { ChartEventFilters } from '@cognite/charts-lib';
import { CogniteEvent } from '@cognite/sdk';

export type EventsEntry = {
  id: number;
};

export type EventsCollection = EventsEntry[];

export type ChartEventResults = ChartEventFilters & {
  results: CogniteEvent[] | undefined;
  isLoading?: boolean;
};
