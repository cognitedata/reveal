import {
  DocumentFilter,
  DocumentSearch,
  DocumentSearchAggregate,
} from '@cognite/sdk';
import { Geometry, GeoJson } from '@cognite/seismic-sdk-js';

import { MapLayerGeoJsonFilter } from '../sidebar/types';

// Document state

export interface DocumentState {
  selectedDocumentIds: string[];
  extractParentFolderPath?: string;
  selectedColumns: string[];
  viewMode: ViewMode;
}

// other types:

export interface SearchHighlight {
  externalId?: string[];
  name?: string[];
  content?: string[];
}

export type DateRange = {
  min?: number;
  max?: number;
};

export interface Result {
  query: DocumentSearch['search'];
  filter?: DocumentFilter;
}

export interface DocumentResult {
  count: number;
  nextCursor?: string;
  hits: DocumentType[];
  facets: DocumentResultFacets;
  aggregates?: DocumentSearchAggregate[];
}

export interface DocumentLabel {
  externalId: string;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  filepath: string;
  url?: string;
  fileCategory: string;
  labels: DocumentLabel[];
  location: string;
  author: string;
  title: string;
  // raw size
  filesize?: number;
  // size for display
  size?: string;
  pageCount?: number;
  topfolder: string;
  truncatedContent?: string;
  assetIds?: number[];
}

export interface DocumentHighlight {
  content: string[];
}

export interface DocumentType {
  // data state
  id: string;
  externalId?: string;
  doc: DocumentMetadata;
  highlight: DocumentHighlight;
  filepath?: string;
  fullFilePath?: string;
  title: string;
  labels?: string[];
  filename?: string;
  geolocation: Geometry | null;

  modified?: Date;
  modifiedDisplay: string;
  created?: Date;
  createdDisplay: string;

  // ui state
  selected?: boolean;
  duplicates?: DocumentType[];
  truncatedContent?: string;
}

export interface QueryFacet {
  selected?: boolean;
  name: string;
  key: string;
}
export interface DocumentQueryFacet extends QueryFacet {
  count: number;
}

export type DocumentQueryFacetsNames =
  | 'labels'
  | 'location'
  | 'fileCategory'
  | 'lastcreated'
  | 'lastmodified'
  | 'pageCount'
  | 'authors';

// officialy facets for unstructured search
export type DocumentQueryFacets = Record<AggregateNames, DocumentQueryFacet[]>;

export type AggregateNames =
  | 'labels'
  | 'location'
  | 'fileCategory'
  | 'lastcreated'
  | 'total'
  | 'pageCount';

export type DocumentResultFacets = Record<AggregateNames, DocumentQueryFacet[]>;

/**
 * This is the structure that we pass into document service. This should decouple app from api side.
 */
export interface SearchQueryFull {
  phrase: string;
  facets: DocumentsFacets;
  geoFilter: GeoJson[];
  extraGeoJsonFilters?: MapLayerGeoJsonFilter[];
  extraDocumentFilters?: DocumentFilter;
}

export type ViewMode = 'card' | 'table';

/**
 * Document filters
 */

export interface DocumentsFacetLabels {
  externalId: string;
}

export interface DocumentsFacets {
  fileCategory: string[];
  labels: DocumentsFacetLabels[];
  lastmodified: string[];
  lastcreated: string[];
  location: string[];
  pageCount: string[];
  authors: string[];
}

export type DocumentFacet = keyof DocumentsFacets;

/**
 * Document Facet structure is not human friendly (Displayable)
 * This type is to store display able structure of a facet
 */
export interface FormattedFacet {
  facet: DocumentFacet;
  facetNameDisplayFormat: string;
  facetValueDisplayFormat: string;
}

export type CategoryResponse = {
  facets: DocumentQueryFacet[];
  total: number;
};

export enum DocumentFilterCategoryTitles {
  fileCategory = 'File Type',
  labels = 'Document Category',
  location = 'Source',
  lastmodified = 'Last Modified',
  lastcreated = 'Created',
  pageCount = 'Page Count',
  authors = 'Author',
}

export type FacetsCounts = {
  [key: string]: number;
};

export type BatchedDocumentsFilters = { filters: DocumentFilter }[];
