import { CogniteClient } from '@cognite/sdk';
import { GeoJson } from '@cognite/seismic-sdk-js';

import { DocumentsFacets, SearchQueryFull } from '../utils/types';

export type ExportEquipmentsModal = {
  isExportSelectedEquipments: boolean;
};

export type DocumentSearchState = SearchQueryFull;

export type DocumentSearchAction =
  | {
      type: DocumentSearchActionType.SET_SEARCH_PHRASE;
      phrase: string;
    }
  | {
      type: DocumentSearchActionType.SET_SEARCH_FILTER;
      facets: DocumentsFacets;
    }
  | {
      type: DocumentSearchActionType.SET_GEO_LOCATION;
      geoLocation: GeoJson[];
    };

export enum DocumentSearchActionType {
  SET_SEARCH_PHRASE = 'set-search-phrase',
  SET_SEARCH_FILTER = 'set-search-filter',
  SET_GEO_LOCATION = 'set-geo-location',
}

export interface ProjectConfigDocuments {
  limit?: number;
}

export interface DocumentSearchConfig {
  cogniteClient?: CogniteClient;
  config?: ProjectConfigDocuments;
  onFilterChange?: (facets: DocumentsFacets) => void;
}

export interface DocumentSearchDispatch {
  setSearchPhrase: (phrase: string) => void;
  setSearchFilters: (facets: DocumentsFacets) => void;
  setGeoLocation: (geoLocation: GeoJson[]) => void;
}
