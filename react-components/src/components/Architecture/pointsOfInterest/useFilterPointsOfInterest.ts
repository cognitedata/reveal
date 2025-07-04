import { useMemo } from 'react';
import { type PointOfInterest } from '../../../architecture';
import { type PoiFilter } from './PoiList';

/**
 * Filters the Points of interest with the provided PoiFilter
 */
export const useFilterPointsOfInterest = (
  pois: Array<PointOfInterest<unknown>>,
  poiFilter: PoiFilter | undefined
): Array<PointOfInterest<unknown>> => {
  return useMemo(() => pois.filter((poi) => filterPoi(poi, poiFilter)), [pois, poiFilter]);
};

function filterPoi(poi: PointOfInterest<unknown>, filter: PoiFilter | undefined): boolean {
  if (filter === undefined) {
    return true;
  }

  const lowerCaseContainsFilter = filter.contains.toLowerCase();
  const titleContainsFilter = poi.properties.name?.toLowerCase().includes(lowerCaseContainsFilter);
  const idContainsFilter = JSON.stringify(poi.id).toLowerCase().includes(lowerCaseContainsFilter);

  return titleContainsFilter || idContainsFilter;
}
