import { documentValuesPayload } from 'domain/documents/utils/documentValuesPayload';

import { useDispatch } from 'react-redux';

import get from 'lodash/get';
import { getEmptyGeometry } from 'utils/geometry';

import { DocumentsFacets } from 'modules/documentSearch/types';

import { inspectTabsActions } from '../actions';
import { useRelatedDocumentsFilters } from '../selectors';

export const useSetRelatedDocumentsFilters = () => {
  const dispatch = useDispatch();
  const data = useRelatedDocumentsFilters();

  return (
    facets: Partial<DocumentsFacets>,
    query: string = get(data, 'query', '')
  ) => {
    const patchedFacets = {
      ...get(data, 'filters.documents.facets'),
      ...facets,
    };
    return dispatch(
      inspectTabsActions.setRelatedDocumentsFilters(
        documentValuesPayload(query, patchedFacets, getEmptyGeometry())
      )
    );
  };
};
