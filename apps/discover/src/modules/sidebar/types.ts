import { GeoJSONGeometry } from '@cognite/geospatial-sdk-js';
import { DocumentsFilter } from '@cognite/sdk-playground';

import { DocumentsFacetLabels, DocumentsFacets } from '../documentSearch/types';
import { WellFilterMap } from '../wellSearch/types';

import {
  TOGGLE_FILTER_BAR,
  SET_CATEGORY_FILTERS,
  SET_CATEGORY_PAGE,
  UPDATE_CATEGORY_APPLIED_FILTERS,
  UPDATE_CATEGORY_APPLIED_FILTER,
  UPDATE_CATEGORY_COLLAPSE_KEY,
  SET_SEARCH_PHRASE,
} from './constants';

/**
 * This enum and derived key type(ModuleKeys) and value type (ModulesValueType)
 * should represent any property related to modues.
 */

export enum Modules {
  DOCUMENTS = 'documents',
  WELLS = 'wells',
  SEISMIC = 'seismic',
}

export type ModulesValueType =
  | Modules.DOCUMENTS
  | Modules.WELLS
  | Modules.SEISMIC;

export type CategoryTypes = ModulesValueType | 'landing';

type FilterType = Record<string, string[]>;

export interface MapLayerGeoJsonFilter {
  label: string;
  geoJson: GeoJSONGeometry;
}

export type AppliedFiltersType = {
  documents: DocumentsFacets;
  seismic: FilterType;
  wells: WellFilterMap;
  landing: FilterType;
  extraDocumentsFilters?: DocumentsFilter;
  extraGeoJsonFilters?: MapLayerGeoJsonFilter[];
};

export type ActiveKeysType = {
  [key in CategoryTypes]: string | string[];
};

export interface SidebarState {
  isOpen: boolean;
  category: CategoryTypes;
  activeKeys: ActiveKeysType;
  appliedFilters: AppliedFiltersType;
  searchPhrase: string;
}

export type DocumentFacetValue = DocumentsFacetLabels[] | string[];

export type AppliedFilterEntries = [keyof DocumentsFacets, DocumentFacetValue];

/**
 * Generic types for updating applied filters
 */

type FacetValue<T, K extends keyof T = keyof T> = T[K] extends unknown
  ? T[K]
  : never;

export type AppliedFilterFacetValueUpdateType = {
  [Category in keyof AppliedFiltersType]: { category: Category } & {
    [Key in keyof AppliedFiltersType[Category]]: {
      facet: Key;
      value: FacetValue<AppliedFiltersType[Category], Key>;
    };
  }[keyof AppliedFiltersType[Category]];
}[keyof AppliedFiltersType];

export type UpdateCategoryCollapseKeyType = {
  category: CategoryTypes;
  value: string | string[];
};

export type UpdateWellAppliedFilters = {
  category: 'wells';
  value: WellFilterMap;
};

export type UpdateDocumentAppliedFilters = {
  category: 'documents';
  value: DocumentsFacets;
  extraDocumentFilters?: DocumentsFilter;
};

export type UpdateCategoryAppliedFilterType =
  | UpdateWellAppliedFilters
  | UpdateDocumentAppliedFilters;

interface ToggleFilterBar {
  type: typeof TOGGLE_FILTER_BAR;
}
interface SetCategoryPage {
  type: typeof SET_CATEGORY_PAGE;
  payload: CategoryTypes;
}
interface UpdateCategoryCollapseKey {
  type: typeof UPDATE_CATEGORY_COLLAPSE_KEY;
  payload: { category: CategoryTypes; facet: string | string[] };
}
interface UpdateCategoryAppliedFilter {
  type: typeof UPDATE_CATEGORY_APPLIED_FILTER;
  payload: {
    category: CategoryTypes;
    facet: string | number;
    value: string[];
  };
}

interface UpdateCategoryAppliedFilters {
  type: typeof UPDATE_CATEGORY_APPLIED_FILTERS;
  payload: {
    category: CategoryTypes;
    value: DocumentsFacets | WellFilterMap;
  };
}

interface SetCategoryFilters {
  type: typeof SET_CATEGORY_FILTERS;
  payload: AppliedFiltersType;
}

interface SetSearchPhrase {
  type: typeof SET_SEARCH_PHRASE;
  payload: string;
}

export type SidebarActions =
  | ToggleFilterBar
  | SetCategoryPage
  | UpdateCategoryCollapseKey
  | UpdateCategoryAppliedFilter
  | UpdateCategoryAppliedFilters
  | SetCategoryFilters
  | SetSearchPhrase;
