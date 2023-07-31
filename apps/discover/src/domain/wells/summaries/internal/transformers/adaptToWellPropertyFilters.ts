import compact from 'lodash/compact';
import groupBy from 'lodash/groupBy';
import uniq from 'lodash/uniq';

import { WellPropertiesSummaryRow } from '@cognite/sdk-wells';

import {
  WELL_PROPERTY_FILTER_IDS,
  WELL_PROPERTY_FILTER_ID_MAP,
} from '../constants';
import {
  WellPropertyFilterGroup,
  WellPropertyFilterIDs,
  WellPropertyFilters,
} from '../types';

export const adaptToWellPropertyFilters = (
  wellProperties: WellPropertiesSummaryRow[]
): WellPropertyFilters => {
  return WELL_PROPERTY_FILTER_IDS.reduce((filters, filterID) => {
    const groupedProperties = groupBy(
      wellProperties,
      WELL_PROPERTY_FILTER_ID_MAP[filterID]
    );

    const filterGroup = Object.keys(groupedProperties).reduce(
      (groups, property) => {
        return {
          ...groups,
          [property]: getWellPropertyFilterGroup(groupedProperties[property]),
        };
      },
      {} as Record<string, WellPropertyFilterGroup>
    );

    return {
      ...filters,
      [filterID]: filterGroup,
    };
  }, {} as WellPropertyFilters);
};

export const getWellPropertyFilterGroup = (
  wellProperties: WellPropertiesSummaryRow[]
): WellPropertyFilterGroup => {
  return WELL_PROPERTY_FILTER_IDS.reduce((group, filterID) => {
    return {
      ...group,
      [filterID]: getWellPropertyValues(wellProperties, filterID),
    };
  }, {} as WellPropertyFilterGroup);
};

export const getWellPropertyValues = (
  wellProperties: WellPropertiesSummaryRow[],
  filterID: WellPropertyFilterIDs
) => {
  const accessor = WELL_PROPERTY_FILTER_ID_MAP[filterID];
  return uniq(compact(wellProperties.map((property) => property[accessor])));
};
