import merge from 'lodash/merge';
import { getDataAvailabilityFilter } from 'services/well/well/filters/getDataAvailabilityFilter';
import { getPolygonFilter } from 'services/well/well/filters/getPolygonFilter';

import { WellFilter } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useGeoFilter } from 'modules/map/selectors';
import { useAppliedWellFilters } from 'modules/sidebar/selectors';
import { FilterIDs } from 'modules/wellSearch/constants';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { getBlockFilter } from './getBlockFilter';
import { getDataSourceFilter } from './getDataSourceFilter';
import { getDogLegSeverityFilter } from './getDogLegSeverityFilter';
import { getFieldFilter } from './getFieldFilter';
import { getKBElevationFilter } from './getKBElevationFilter';
import { getMaxInclinationAngleFilter } from './getMaxInclinationAngleFilter';
import { getMDFilter } from './getMDFilter';
import { getMeasurementFilter } from './getMeasurementFilter';
import { getNDSProbabilityFilter } from './getNDSProbabilityFilter';
import { getNDSRiskFilter } from './getNDSRiskFilter';
import { getNDSSeverityFilter } from './getNDSSeverityFilter';
import { getNPTDetailFilter } from './getNPTDetailFilter';
import { getNPTDurationFilter } from './getNPTDurationFilter';
import { getNPTFilter } from './getNPTFilter';
import { getOperatorFilter } from './getOperatorFilter';
import { getRegionFilter } from './getRegionFilter';
import { getSpudDateFilter } from './getSpudDateFilter';
import { getTVDFilter } from './getTVDFilter';
import { getWaterDepthFilter } from './getWaterDepthFilter';
import { getWellTypeFilter } from './getWellTypeFilter';

const filtersWithUnit: Record<
  number,
  (data: unknown, unit?: UserPreferredUnit) => unknown
> = {
  [FilterIDs.KB]: getKBElevationFilter,
  [FilterIDs.MD]: getMDFilter,
  [FilterIDs.TVD]: getTVDFilter,
  [FilterIDs.WATER_DEPTH]: getWaterDepthFilter,
};

const filters: Record<number, (data: unknown) => unknown> = {
  [FilterIDs.BLOCK]: getBlockFilter,
  [FilterIDs.DATA_AVAILABILITY]: getDataAvailabilityFilter,
  [FilterIDs.DATA_SOURCE]: getDataSourceFilter,
  [FilterIDs.FIELD]: getFieldFilter,
  [FilterIDs.MAXIMUM_INCLINATION_ANGLE]: getMaxInclinationAngleFilter,
  [FilterIDs.MEASUREMENTS]: getMeasurementFilter,
  [FilterIDs.NDS_PROBABILITY]: getNDSProbabilityFilter,
  [FilterIDs.NDS_RISKS_TYPE]: getNDSRiskFilter,
  [FilterIDs.NDS_SEVERITY]: getNDSSeverityFilter,
  [FilterIDs.NPT_CODE]: getNPTFilter,
  [FilterIDs.NPT_DETAIL_CODE]: getNPTDetailFilter,
  [FilterIDs.NPT_DURATION]: getNPTDurationFilter,
  [FilterIDs.OPERATOR]: getOperatorFilter,
  [FilterIDs.REGION]: getRegionFilter,
  [FilterIDs.SPUD_DATE]: getSpudDateFilter,
  [FilterIDs.WELL_TYPE]: getWellTypeFilter,
};

export const useWellFilters = () => {
  const wellFilters = useAppliedWellFilters();
  const geoFilter = useGeoFilter();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const { data: wellConfig } = useWellConfig();

  return useDeepMemo(() => {
    const filter: WellFilter = Object.keys(wellFilters).reduce(
      (prev, current) => {
        const id = Number(current);

        // need to find a way to remove this as an exception
        // it needs values from wellConfig, so has a different signature
        if (id === FilterIDs.DOG_LEG_SEVERITY) {
          return merge(
            prev,
            getDogLegSeverityFilter(
              wellFilters[id],
              userPreferredUnit,
              wellConfig?.well_characteristics_filter?.dls
            )
          );
        }

        if (filters[id]) {
          return merge(prev, filters[id](wellFilters[id]));
        }

        if (filtersWithUnit[id]) {
          return merge(
            prev,
            filtersWithUnit[id](wellFilters[id], userPreferredUnit)
          );
        }

        return {};
      },
      {} as WellFilter
    );

    // Apply Geo Filter
    if (geoFilter && geoFilter.length > 0) {
      filter.polygon = getPolygonFilter(geoFilter);
    }

    return filter;
  }, [
    wellFilters,
    geoFilter,
    wellConfig?.well_characteristics_filter?.dls,
    userPreferredUnit,
  ]);
};
