import { WellEventLegendCreateBody } from '@cognite/discover-api-types';

export type WellLegendType = 'code' | 'detailCode';

export type WellLegendPayload = { id: string; body: WellEventLegendCreateBody };
