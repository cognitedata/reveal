import { GeoJson } from '@cognite/seismic-sdk-js';
import {
  Reducer,
  useContext,
  useEffect,
  useReducer,
  createContext,
  useMemo,
} from 'react';

import { DocumentsFacets } from '../utils/types';

import { documentFacetsStructure } from './fixture';
import {
  DocumentSearchAction,
  DocumentSearchState,
  DocumentSearchActionType,
  DocumentSearchConfig,
  DocumentSearchDispatch,
} from './types';

const initialState: DocumentSearchState = {
  phrase: '',
  facets: documentFacetsStructure,
  geoFilter: [],
};

// Context

const DocumentSearchConfigContext = createContext<DocumentSearchConfig>({});
export const useDocumentSearchConfig = () =>
  useContext(DocumentSearchConfigContext);

const DocumentSearchContext = createContext<DocumentSearchState>(initialState);
export const useDocumentSearchState = () => useContext(DocumentSearchContext);

const DocumentSearchDispatchContext = createContext<DocumentSearchDispatch>({
  setSearchPhrase: () => null,
  setSearchFilters: () => null,
  setGeoLocation: () => null,
});
export const useDocumentSearchDispatch = () =>
  useContext(DocumentSearchDispatchContext);

// Document state reducer

function reducer(state: DocumentSearchState, action: DocumentSearchAction) {
  switch (action.type) {
    case DocumentSearchActionType.SET_SEARCH_PHRASE:
      return {
        ...state,
        phrase: action.phrase,
      };
    case DocumentSearchActionType.SET_SEARCH_FILTER:
      return {
        ...state,
        facets: action.facets,
      };
    case DocumentSearchActionType.SET_GEO_LOCATION:
      return {
        ...state,
        geoFilter: action.geoLocation,
      };
    default: {
      return state;
    }
  }
}

// Provider

export const DocumentSearchProvider: React.FC<
  React.PropsWithChildren<DocumentSearchConfig>
> = ({ children, cogniteClient, config, onFilterChange }) => {
  const [state, dispatch] = useReducer<
    Reducer<DocumentSearchState, DocumentSearchAction>
  >(reducer, initialState);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(state.facets);
    }
  }, [state.facets]);

  const documentSearchDispatch = useMemo(() => {
    return {
      setSearchPhrase: dispatchSearchPhrase(dispatch),
      setSearchFilters: dispatchSearchFacets(dispatch),
      setGeoLocation: dispatchGeoFilters(dispatch),
    };
  }, [dispatch]);

  const documentSearchConfig = useMemo(() => {
    return {
      cogniteClient,
      config,
    };
  }, [config, cogniteClient]);

  return (
    <DocumentSearchConfigContext.Provider value={documentSearchConfig}>
      <DocumentSearchContext.Provider value={state}>
        <DocumentSearchDispatchContext.Provider value={documentSearchDispatch}>
          {children}
        </DocumentSearchDispatchContext.Provider>
      </DocumentSearchContext.Provider>
    </DocumentSearchConfigContext.Provider>
  );
};

// Dispatch actions

const dispatchSearchPhrase =
  (dispatch: React.Dispatch<DocumentSearchAction>) => (phrase: string) => {
    dispatch({ type: DocumentSearchActionType.SET_SEARCH_PHRASE, phrase });
  };

const dispatchSearchFacets =
  (dispatch: React.Dispatch<DocumentSearchAction>) =>
  (facets: DocumentsFacets) => {
    dispatch({ type: DocumentSearchActionType.SET_SEARCH_FILTER, facets });
  };

const dispatchGeoFilters =
  (dispatch: React.Dispatch<DocumentSearchAction>) =>
  (geoLocation: GeoJson[]) => {
    dispatch({ type: DocumentSearchActionType.SET_GEO_LOCATION, geoLocation });
  };
