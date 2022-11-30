import { CogniteEvent } from '@cognite/sdk';
import { ChartEventFilters } from 'models/chart/types';

export type EventsEntry = {
  id: number;
};

export type EventsCollection = EventsEntry[];

export type ChartEventResults = ChartEventFilters & {
  results: CogniteEvent[];
};
