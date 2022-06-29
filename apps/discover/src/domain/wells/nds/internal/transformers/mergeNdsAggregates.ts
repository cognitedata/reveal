import isNil from 'lodash/isNil';
import { mergeUniqueArray } from 'utils/merge';

import { NdsAggregateRow } from '@cognite/sdk-wells-v3';

import { WellboreNdsAggregatesSummary } from '../types';

const ORPHAN_SUBTYPES = 'ORPHAN_SUBTYPES';

export const mergeNdsAggregates = (
  ndsAggregateRows: NdsAggregateRow[] | undefined
) => {
  return (ndsAggregateRows || []).reduce((merged, ndsAggregateRow) => {
    return mergeUniqueArray(merged, mergeNdsAggregateRow(ndsAggregateRow));
  }, {} as WellboreNdsAggregatesSummary);
};

const mergeNdsAggregateRow = (
  ndsAggregateRow: NdsAggregateRow
): WellboreNdsAggregatesSummary => {
  const { severity, probability, riskType, subtype } = ndsAggregateRow;

  return {
    severities: getValueAsStringArray(severity),
    probabilities: getValueAsStringArray(probability),
    riskTypesAndSubtypes: mergeRiskTypeAndSubtype(riskType, subtype),
  };
};

const mergeRiskTypeAndSubtype = (
  riskType?: string,
  subtype?: string
): Record<string, string[]> => {
  if (riskType) {
    return {
      [riskType]: getValueAsStringArray(subtype, true),
    };
  }

  if (subtype) {
    return {
      [ORPHAN_SUBTYPES]: getValueAsStringArray(subtype, true),
    };
  }

  return {};
};

const getValueAsStringArray = (
  value?: string | number | null,
  skipNullValues?: boolean
): string[] => {
  return skipNullValues && isNil(value) ? [] : [String(value)];
};
