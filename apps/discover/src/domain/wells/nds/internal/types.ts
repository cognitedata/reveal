import { ConvertedDistance } from 'utils/units/constants';

import { Distance, Nds, NdsAggregate } from '@cognite/sdk-wells';

export interface NdsInternal
  extends Omit<Nds, 'holeDiameter' | 'holeTop' | 'holeBase'> {
  holeDiameter?: ConvertedDistance;
  holeTop?: ConvertedDistance;
  holeBase?: ConvertedDistance;
  ndsCodeColor: string;
}

export interface NdsWithTvd extends Nds {
  holeTopTvd?: Distance;
  holeBaseTvd?: Distance;
}

export interface NdsInternalWithTvd extends NdsInternal {
  holeTopTvd?: ConvertedDistance;
  holeBaseTvd?: ConvertedDistance;
}

export type NdsAggregatesInternal = Record<
  NdsAggregate['wellboreMatchingId'],
  NdsAggregate['items']
>;

export type NdsAggregatesSummary = Record<string, WellboreNdsAggregatesSummary>;

export interface WellboreNdsAggregatesSummary {
  severities: string[];
  probabilities: string[];
  riskTypesAndSubtypes: NdsRiskTypesSelection;
}

export type NdsRiskTypesSelection = Record<string, string[]>;
