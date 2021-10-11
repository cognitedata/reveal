import { useDispatch } from 'react-redux';

import { documentSearchActions } from 'modules/documentSearch/actions';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { getEmptyFacets } from 'modules/documentSearch/utils';
import { useGeoFilter } from 'modules/map/selectors';
import { useSearchPhrase } from 'modules/sidebar/selectors';

export const useSetIsolatedDocumentResultFacets = () => {
  const phrase = useSearchPhrase();
  const geoFilter = useGeoFilter();
  const emptyFacets = getEmptyFacets();
  const dispatch = useDispatch();

  return (isolatedDocumentsFacets: Partial<DocumentsFacets>) => {
    const facets = { ...emptyFacets, ...isolatedDocumentsFacets };
    const query = { phrase, facets, geoFilter };

    dispatch(documentSearchActions.isolatedSearch(query, undefined, 0));
  };
};
