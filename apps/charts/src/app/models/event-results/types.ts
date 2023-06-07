import { CogniteEvent } from '@cognite/sdk';
import { ChartEventFilters } from '@charts-app/models/chart/types';

export type EventsEntry = {
  id: number;
};

export type EventsCollection = EventsEntry[];

export type ChartEventResults = ChartEventFilters & {
  results: CogniteEvent[] | undefined;
  isLoading?: boolean;
};
