import { useMemo } from 'react';
import { PointOfInterest } from '../../../architecture';
import { PoiFilter } from './PoiList';
import { filter } from 'lodash';

/**
 * Filters the Points of interest with the provided PoiFilter
 */
export const useFilterPointsOfInterest = (
  pois: PointOfInterest<unknown>[],
  poiFilter: PoiFilter | undefined
): PointOfInterest<unknown>[] => {
  return useMemo(() => pois.filter((poi) => filterPoi(poi, poiFilter)), [pois, poiFilter]);
};

function filterPoi(poi: PointOfInterest<unknown>, filter: PoiFilter | undefined): boolean {
  if (filter === undefined) {
    return true;
  }

  const lowerCaseContainsFilter = filter.contains.toLowerCase();

  return (
    poi.properties.title?.toLowerCase().includes(lowerCaseContainsFilter) === true ||
    JSON.stringify(poi.id).toLowerCase().includes(lowerCaseContainsFilter)
  );
}
