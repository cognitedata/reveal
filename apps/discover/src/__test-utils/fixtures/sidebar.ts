import { DocumentsFacets, FormattedFacet } from 'modules/documentSearch/types';
import { initialState as sideBarState } from 'modules/sidebar/reducer';
import {
  SidebarState,
  AppliedFiltersType,
  ActiveKeysType,
} from 'modules/sidebar/types';
import {
  REGION_FIELD_BLOCK,
  WELL_CHARACTERISTICS,
} from 'modules/wellSearch/constantsSidebarFilters';
import { FilterValues, WellFilterMap } from 'modules/wellSearch/types';

import { Modules } from '../../modules/sidebar/types';

export const DEFAULT_SEARCH_PHRASE = 'Well A';
export const DEFAULT_OPEN_CATEGORY = Modules.WELLS;
export const DEFAULT_CATEGORIES = [REGION_FIELD_BLOCK, WELL_CHARACTERISTICS];

export const getMockState: (extras?: Partial<SidebarState>) => SidebarState = (
  extras = {}
) => ({
  ...sideBarState,
  ...extras,
});

export const getEmptyAppliedFilterType = (
  extras?: Partial<AppliedFiltersType>
): AppliedFiltersType => {
  return {
    documents: {
      fileCategory: [],
      labels: [],
      lastmodified: [],
      lastcreated: [],
      location: [],
      pageCount: [],
    },
    seismic: {},
    wells: {},
    landing: {},
    ...extras,
  };
};

export const getMockAppliedFiltersType: (
  documentFiltersExtras?: Partial<DocumentsFacets>,
  wellFiltersExtras?: Partial<WellFilterMap>
) => AppliedFiltersType = (
  documentFiltersExtras = {},
  wellFiltersExtras = {}
) => {
  return getEmptyAppliedFilterType({
    documents: getMockDocumentFilter(documentFiltersExtras),
    wells: getMockWellFilter(wellFiltersExtras),
  });
};

export const getMockDocumentFilter: (
  extras?: Partial<DocumentsFacets>
) => DocumentsFacets = (extras = {}) => {
  return {
    fileCategory: ['Compressed', 'Image'],
    labels: [{ externalId: '1' }],
    lastmodified: [],
    lastcreated: [],
    location: ['Bp-Blob'],
    pageCount: ['2', '3'],
    ...extras,
  };
};

export const getMockWellFilter: (
  extras?: Partial<WellFilterMap>
) => WellFilterMap = (extras = {}) => {
  return {
    2: ['BOEM', 'BP-Penquin'],
    4: ['Atlantis', 'Mad Dog'],
    ...extras,
  };
};

export const getMockWellFilterExtra = getMockWellFilter({
  '1': ['carina', 'sol'],
  '2': ['Ganymede', 'Carme group'],
  '3': ['Adad'],
  '4': ['Cognite'],
  '10': ['caliper'],
  '12': ['Casing'],
  '16': ['DFAL'],
  '17': ['BARR', 'BHA', 'CASE', 'CEQP', 'CODE', 'COIL', 'CWOR', 'CMTO'],
  '19': ['Abandoned', 'Exploration'],
  '20': ['Jovian System'],
  '40': ['NDS events'],
});

export const getMockActiveKeys: (
  extras?: Partial<ActiveKeysType>
) => ActiveKeysType = (extras = {}) => {
  return {
    documents: ['0', '1'],
    seismic: [],
    wells: [REGION_FIELD_BLOCK, 'Well Characteristics'],
    landing: [],
    ...extras,
  };
};

export const getMockSidebarState: (
  extras?: Partial<SidebarState>
) => SidebarState = (extras = {}) => {
  return {
    isOpen: true,
    category: DEFAULT_OPEN_CATEGORY,
    activeKeys: getMockActiveKeys(extras.activeKeys),
    appliedFilters: getEmptyAppliedFilterType({
      documents: getMockDocumentFilter(extras.appliedFilters?.documents),
      wells: getMockWellFilter(extras.appliedFilters?.wells),
    }),
    searchPhrase: DEFAULT_SEARCH_PHRASE,
    ...extras,
  };
};

export const getMockFormattedFacet: (
  extras?: Partial<FormattedFacet>
) => FormattedFacet = (extras = {}) => {
  return {
    facet: 'fileCategory',
    facetNameDisplayFormat: 'File Type',
    facetValueDisplayFormat: 'PDF',
    ...extras,
  };
};

export const getMockFilterValue: (
  extras?: Partial<FilterValues>
) => FilterValues = (extras = {}) => {
  return {
    id: 0,
    category: 'Category 1',
    field: 'Source',
    value: 'EDM',
    displayName: 'EDM',
    ...extras,
  };
};
