import {
  DocumentFilter,
  DocumentSearch,
  DocumentSearchAggregate,
} from '@cognite/sdk';
import { GeoJson, Geometry } from '@cognite/seismic-sdk-js';

export type DateRange = {
  min?: number;
  max?: number;
};

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

export interface MapLayerGeoJsonFilter {
  label: string;
  geoJson: Geometry;
}

export interface QueryFacet {
  selected?: boolean;
  name: string;
  key: string;
}
export interface DocumentQueryFacet extends QueryFacet {
  count: number;
}

export type DocumentResultFacets = Record<AggregateNames, DocumentQueryFacet[]>;

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

export interface Result {
  query: DocumentSearch['search'];
  filter?: DocumentFilter;
}

export interface DocumentHighlight {
  content: string[];
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

export interface DocumentResult {
  count: number;
  nextCursor?: string;
  hits: DocumentType[];
  facets: DocumentResultFacets;
  aggregates?: DocumentSearchAggregate[];
}
