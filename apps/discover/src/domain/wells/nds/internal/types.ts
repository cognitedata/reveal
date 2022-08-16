import { ConvertedDistance } from 'utils/units/constants';

import { Nds, NdsAggregate } from '@cognite/sdk-wells';

export interface NdsInternal
  extends Omit<Nds, 'holeDiameter' | 'holeStart' | 'holeEnd'> {
  holeDiameter?: ConvertedDistance;
  holeStart?: ConvertedDistance;
  holeEnd?: ConvertedDistance;
  ndsCodeColor: string;
}

export interface NdsInternalWithTvd extends NdsInternal {
  holeStartTvd?: ConvertedDistance;
  holeEndTvd?: ConvertedDistance;
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
