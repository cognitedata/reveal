import { WellboreNdsAggregatesSummary } from '../types';

export const getEmptyNdsAggregatesMerged = (): WellboreNdsAggregatesSummary => {
  return {
    severities: [],
    probabilities: [],
    riskTypesAndSubtypes: {},
  };
};
