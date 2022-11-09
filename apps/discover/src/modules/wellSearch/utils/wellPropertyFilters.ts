import { WELL_PROPERTY_FILTER_IDS } from 'domain/wells/summaries/internal/constants';
import {
  WellPropertyFilterIDs,
  WellPropertyFilterGroup,
  WellPropertyHierarchy,
} from 'domain/wells/summaries/internal/types';

import difference from 'lodash/difference';

import { WellFilterMap } from '../types';

export const processHierarchy = (
  hierarchy: WellPropertyFilterIDs[]
): WellPropertyHierarchy => {
  return hierarchy.reduce((result, id, index) => {
    const parents = hierarchy.slice(0, index);
    const children = hierarchy.slice(index + 1);

    return {
      ...result,
      [id]: { parents, children },
    };
  }, {} as WellPropertyHierarchy);
};

export const getResultFromFilterMap = (
  selectedOptions: WellFilterMap
): WellPropertyFilterGroup => {
  return WELL_PROPERTY_FILTER_IDS.reduce((result, id) => {
    return {
      ...result,
      [id]: selectedOptions[id] || [],
    };
  }, {} as WellPropertyFilterGroup);
};

export const getResultDifference = (
  currentResult: WellPropertyFilterGroup,
  updatedResult: WellPropertyFilterGroup
): WellPropertyFilterGroup => {
  return WELL_PROPERTY_FILTER_IDS.reduce<WellPropertyFilterGroup>(
    (result, id) => {
      return {
        ...result,
        [id]: difference(currentResult[id], updatedResult[id]),
      };
    },
    {} as WellPropertyFilterGroup
  );
};
