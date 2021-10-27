import { CogniteClient, ExternalEvent, Metadata } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';

interface CalculationRunFilter {
  source: string;
  type: string;
  metadata: Metadata;
}
interface FilteredClient {
  client: CogniteClient;
  filter: CalculationRunFilter;
}
interface NewCalculationClient {
  client: CogniteClient;
  item: ExternalEvent;
}

export const fetchLatestEventByCalculationId = createAsyncThunk(
  'event/fetchLatestEventByCalculationId',
  async ({ client, filter }: FilteredClient) =>
    (
      await client.events.list({
        filter,
        limit: 1,
        sort: { lastUpdatedTime: 'desc' },
      })
    ).items.map((event) => ({
      ...event,
      calculationId: filter.metadata.calcConfig,
      createdTime: event.createdTime?.getTime(),
      lastUpdatedTime: event.lastUpdatedTime?.getTime(),
    }))[0]
);

export const runNewCalculation = createAsyncThunk(
  'event/runNewCalculation',
  async ({ client, item }: NewCalculationClient) =>
    (
      await client.events.create([
        {
          ...item,
        },
      ])
    ).map(() => ({
      calculationId: item.externalId || '',
      metadata: {
        status: 'ready',
      },
    }))[0]
);
