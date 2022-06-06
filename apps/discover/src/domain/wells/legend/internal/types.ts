import { WellEventLegendCreateBody } from '@cognite/discover-api-types';

export enum WellLegendNptType {
  Code = 'code',
  DetailCode = 'detailCode',
}

export type WellLegendPayload = { id: string; body: WellEventLegendCreateBody };
