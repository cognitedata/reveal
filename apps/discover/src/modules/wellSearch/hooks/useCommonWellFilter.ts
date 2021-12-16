import merge from 'lodash/merge';

import { Polygon } from '@cognite/sdk-wells-v2';

import { useDeepMemo } from 'hooks/useDeep';
import { useGeoFilter } from 'modules/map/selectors';
import {
  useAppliedWellFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';

import { CommonWellFilter } from '../types';
import { filterConfigsById } from '../utils/sidebarFilters';

export const useCommonWellFilter = () => {
  const wellFilters = useAppliedWellFilters();
  const geoFilter = useGeoFilter();
  const searchPhrase = useSearchPhrase();

  return useDeepMemo(() => {
    const commonWellFilter: CommonWellFilter = Object.keys(wellFilters).reduce(
      (prev, current) => {
        const id = Number(current);
        const { filterParameters } = filterConfigsById[id];
        return filterParameters && wellFilters[id].length
          ? merge(prev, {
              ...filterParameters(wellFilters[id] as string[]),
              npt: {
                ...prev.npt,
                ...filterParameters(wellFilters[id] as string[]).npt,
              },
              nds: {
                ...prev.nds,
                ...filterParameters(wellFilters[id] as string[]).nds,
              },
            })
          : prev;
      },
      {} as CommonWellFilter
    );

    // Apply Geo Filter
    if (geoFilter && geoFilter.length) {
      commonWellFilter.polygon = {
        geoJsonGeometry: geoFilter[0].geometry as unknown as Polygon,
        crs: 'epsg:4326',
      };
    }

    // Apply Query Filter
    if (searchPhrase) {
      commonWellFilter.stringMatching = searchPhrase;
    }

    return commonWellFilter;
  }, [wellFilters, geoFilter, searchPhrase]);
};
