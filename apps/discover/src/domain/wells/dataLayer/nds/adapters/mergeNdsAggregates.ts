import isNil from 'lodash/isNil';
import { mergeUniqueArray } from 'utils/merge';

import { NdsAggregateRow } from '@cognite/sdk-wells-v3';

import { WellboreNdsAggregatesSummary } from '../types';

const ORPHAN_SUBTYPES = 'ORPHAN_SUBTYPES';

export const mergeNdsAggregates = (ndsAggregateRows: NdsAggregateRow[]) => {
  return ndsAggregateRows.reduce((merged, ndsAggregateRow) => {
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
      [riskType]: getValueAsStringArray(subtype),
    };
  }

  if (subtype) {
    return {
      [ORPHAN_SUBTYPES]: getValueAsStringArray(subtype),
    };
  }

  return {};
};

const getValueAsStringArray = (value?: string | number): string[] => {
  return isNil(value) ? [] : [String(value)];
};
