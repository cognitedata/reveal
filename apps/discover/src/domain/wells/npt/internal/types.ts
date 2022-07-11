import { ConvertedDistance } from 'utils/units/constants';

import { Npt, NptAggregate } from '@cognite/sdk-wells';

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

export interface NptCodeDefinitionType {
  [key: string]: string;
}

export interface NptCodeDetailsDefinitionType {
  [key: string]: string;
}

export interface NptView extends NptInternal {
  wellName: string;
  wellboreName: string;
}
