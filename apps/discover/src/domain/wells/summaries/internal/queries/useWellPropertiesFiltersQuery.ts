import { useQuery } from '@tanstack/react-query';

import { WELL_QUERY_KEY } from 'constants/react-query';

import { getWellProperties } from '../../service/network/getWellProperties';
import { WELL_PROPERTY_FILTER_ID_MAP } from '../constants';
import { adaptToWellPropertyFilters } from '../transformers/adaptToWellPropertyFilters';

export const useWellPropertiesFiltersQuery = () => {
  return useQuery(WELL_QUERY_KEY.WELL_PROPERTY_FILTERS, () =>
    getWellProperties(Object.values(WELL_PROPERTY_FILTER_ID_MAP)).then(
      adaptToWellPropertyFilters
    )
  );
};
