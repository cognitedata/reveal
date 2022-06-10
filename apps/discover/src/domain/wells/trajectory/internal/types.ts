import { TrueVerticalDepths, Wellbore } from '@cognite/sdk-wells-v3';

export interface TrueVerticalDepthsDataLayer extends TrueVerticalDepths {
  mdTvdMap: Record<number, number>;
}

export type KeyedTvdData = Record<
  Wellbore['matchingId'],
  TrueVerticalDepthsDataLayer
>;

export type GroupedTvdData = Record<
  Wellbore['matchingId'],
  TrueVerticalDepthsDataLayer[]
>;
