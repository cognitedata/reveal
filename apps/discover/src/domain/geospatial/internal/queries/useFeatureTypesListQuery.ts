import { useQuery } from 'react-query';

import { GEOSPATIAL_QUERY_KEY } from 'constants/react-query';

import { getFeatureTypesList } from '../../service/network';

export const useFeatureTypesListQuery = () => {
  return useQuery(GEOSPATIAL_QUERY_KEY.FEATURE_TYPES, () =>
    // not to destruct items here, change in sdk required
    getFeatureTypesList().then(({ items }) => items)
  );
};
