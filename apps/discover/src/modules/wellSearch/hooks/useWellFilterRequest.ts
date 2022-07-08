import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';

import {
  GeometryTypeEnum,
  WellFilter,
  WellFilterRequest,
} from '@cognite/sdk-wells-v3';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useGeoFilter } from 'modules/map/selectors';
import {
  useAppliedWellFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';

import { filterConfigsById } from '../../../pages/authorized/search/search/SideBar/filters/well/filters';

export const useWellFilterRequest = (): WellFilterRequest => {
  const wellFilters = useAppliedWellFilters();
  const geoFilter = useGeoFilter();
  const searchPhrase = useSearchPhrase();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  return useDeepMemo(() => {
    const wellFilter: WellFilter = Object.keys(wellFilters).reduce(
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
      {} as WellFilter
    );

    // Apply Geo Filter
    if (!isEmpty(geoFilter)) {
      wellFilter.polygon = {
        geometry: JSON.stringify(geoFilter),
        crs: 'EPSG:4326',
        geometryType: GeometryTypeEnum.GeoJson,
      };
    }

    // Apply Query Filter
    const searchFilter = searchPhrase ? { query: searchPhrase } : {};

    return {
      filter: wellFilter,
      ...searchFilter,
    };
  }, [wellFilters, geoFilter, searchPhrase, userPreferredUnit]);
};
