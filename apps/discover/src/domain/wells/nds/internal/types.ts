import { Nds, NdsAggregate } from '@cognite/sdk-wells-v3';

export interface NdsInternal extends Nds {
  original: Nds;
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
