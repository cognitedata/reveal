import merge from 'lodash/merge';

import { Polygon } from '@cognite/sdk-wells-v2';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useGeoFilter } from 'modules/map/selectors';
import {
  useAppliedWellFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';

import { filterConfigsById } from '../../../pages/authorized/search/search/SideBar/filters/well/filters';
import { CommonWellFilter } from '../types';

export const useCommonWellFilter = () => {
  const wellFilters = useAppliedWellFilters();
  const geoFilter = useGeoFilter();
  const searchPhrase = useSearchPhrase();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    const commonWellFilter: CommonWellFilter = Object.keys(wellFilters).reduce(
      (prev, current) => {
        const id = Number(current);
        const { filterParameters } = filterConfigsById[id];

        return filterParameters && wellFilters[id].length && userPreferredUnit
          ? merge(prev, {
              ...filterParameters(
                wellFilters[id] as string[],
                userPreferredUnit
              ),
              npt: {
                ...prev.npt,
                ...filterParameters(
                  wellFilters[id] as string[],
                  userPreferredUnit
                ).npt,
              },
              nds: {
                ...prev.nds,
                ...filterParameters(
                  wellFilters[id] as string[],
                  userPreferredUnit
                ).nds,
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
        crs: 'EPSG:4326',
      };
    }

    // Apply Query Filter
    if (searchPhrase) {
      commonWellFilter.stringMatching = searchPhrase;
    }

    return commonWellFilter;
  }, [wellFilters, geoFilter, searchPhrase, userPreferredUnit]);
};
