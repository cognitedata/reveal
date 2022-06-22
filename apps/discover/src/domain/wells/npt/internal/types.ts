import { ConvertedDistance } from 'utils/units/constants';

import { Npt, NptAggregate } from '@cognite/sdk-wells-v3';

export interface NptInternal extends Omit<Npt, 'measuredDepth'> {
  nptCode: string;
  nptCodeDetail: string;
  nptCodeColor: string;
  measuredDepth?: ConvertedDistance;
}

export type NptAggregatesInternal = Record<
  NptAggregate['wellboreMatchingId'],
  NptAggregate['items']
>;
