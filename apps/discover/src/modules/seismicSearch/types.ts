import { TS_FIX_ME } from 'core';

import { Geometry } from '@cognite/seismic-sdk-js';

import { TableResults } from 'components/Tablev3/resultTypes';
import { QueryFacet } from 'modules/documentSearch/types';
import { APIGeo } from 'modules/map/types';

// export interface SeismicFacet extends QueryFacet {}
export type SeismicFacet = QueryFacet;
export type FacetType = 'timeDepth' | 'offset';

export type BooleanStateKeys =
  | 'isSeismicCompareOpen'
  | 'isSearching'
  | 'hasSliceImageError';

type SeismicBooleanStates = Record<BooleanStateKeys, boolean>;

export interface SeismicState extends SeismicBooleanStates {
  currentDataQuery: {
    phrase: string;
    hasSearched: boolean;
    facets?: Record<FacetType, SeismicFacet[]>;
  };
  expandedSearchResults: TableResults;
  dataResult: SeismicDataResult[];
  currentSlice?: SeismicCollection;
  sliceCollection: SliceCollection;
  selectedSliceCollectionId?: string;

  isFetchingSubSurveys?: boolean;

  selections: SeismicSelections;
}

export interface SurveyFile {
  surveyId: string;
  fileId: string;
  fileName: string;
}
export interface SeismicSelections {
  surveys: string[];
  files: SurveyFile[];
}

// perhaps this can be more generic across all search types?
export interface Column<T> {
  name: string;
  selected: boolean;
  field: T;
  nowrap: boolean;

  textOverflow?: boolean;
  custom?: (field: any) => any;

  // not currently used:
  maxWidth?: 'auto' | number;
  minWidth?: 'auto' | number;
}
export type Columns<T> = Column<T>[];

export interface SeismicFile {
  id: string;
  surveyId: string;
  survey: string;
  dataSetName: string;
  selected?: boolean; // UI state - show expanded in result list
  isWorking?: boolean; // UI state - when opening in SWA etc

  metadata?: { [s: string]: string | number };
  metadata2?: any;

  geometry?: Geometry;

  // -  dataType: string;
  // -  offset: string;
  // -  timeDepth: string;
  // -  fileSize: number;
  // -  source: string;
  // eslint-disable-next-line camelcase
  // data_type?: string;
  // dimension?: any; // not working
  // processing?: string;
  // eslint-disable-next-line camelcase
  // processing_year?: string;
}

export type SeismicResultColumns = Columns<keyof SeismicFile>;
// this is the top level survey object: (DEPRECATED, use SeismicSurveyContainer instead)
export interface SeismicDataResult {
  id: string;
  survey: string; // aka: survey name
  surveys: SeismicFile[];
  geometry?: Geometry;
  fetchedGeo?: boolean;
  // selected?: boolean; // UI state - show expanded in result list
}
// LETS USE THIS NICER NAME FROM NOW ON:::
export type SeismicSurveyContainer = SeismicDataResult;

export interface SeismicCollection {
  id: string;
  geo?: APIGeo;
  slices: Slices[];
  isLoading: boolean;
  hasError: boolean;
  time: number;
}

export interface Slices {
  id: string;
  data?: SeismicData;
  error: any;
  file: any;
}

interface SeismicData {
  content: TS_FIX_ME[];
  mean: number;
  standardDeviation: number;
}

export type SliceCollection = SeismicCollection[];

export interface SeismicLine {
  id?: string;
  geometry: APIGeo;
}
// export interface SeismicFile {
//   id: SeismicId;
//   survey: string;
// }
export interface LineProps {
  min: number;
  max: number;
}
