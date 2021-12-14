import { useGeoFilter } from 'modules/map/selectors';
import {
  useAppliedDocumentFilters,
  useAppliedDocumentMapLayerFilters,
  useAppliedMapGeoJsonFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';

import { useExtractParentFolderPath } from '../selectors';
import { SearchQueryFull } from '../types';

import { useDocumentConfig } from '.';

export const useDocumentSearchQueryFull = (): SearchQueryFull => {
  const searchPhrase = useSearchPhrase();
  const documentFilters = useAppliedDocumentFilters();
  const geoFilter = useGeoFilter();
  const extraGeoJsonFilters = useAppliedMapGeoJsonFilters();
  const extraDocumentFilters = useAppliedDocumentMapLayerFilters();

  const { data: documentConfig } = useDocumentConfig();
  const extractParentFolderPath = useExtractParentFolderPath();

  const phrase = documentConfig?.extractByFilepath
    ? `path:"${extractParentFolderPath}"`
    : searchPhrase;

  return {
    phrase,
    facets: documentFilters,
    geoFilter,
    extraGeoJsonFilters,
    extraDocumentFilters,
  };
};
