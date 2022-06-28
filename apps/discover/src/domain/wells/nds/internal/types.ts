import { ConvertedDistance } from 'utils/units/constants';

import { Nds, NdsAggregate } from '@cognite/sdk-wells-v3';

export interface NdsInternal
  extends Omit<Nds, 'holeDiameter' | 'holeStart' | 'holeEnd'> {
  holeDiameter?: ConvertedDistance;
  holeStart?: ConvertedDistance;
  holeEnd?: ConvertedDistance;
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
  riskTypesAndSubtypes: Record<string, string[]>;
}
