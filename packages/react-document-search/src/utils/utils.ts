import { aggregates } from './aggregates';
import { DocumentResult, DocumentResultFacets } from './types';

export const getEmptyDocumentStateFacets = (): DocumentResultFacets => ({
  fileCategory: [],
  labels: [],
  lastcreated: [],
  location: [],
  total: [],
  pageCount: [],
});

export const getEmptyDocumentResult = (): DocumentResult => ({
  count: 0,
  hits: [],
  facets: getEmptyDocumentStateFacets(),
  aggregates: aggregates.map((aggregate) => {
    return {
      name: aggregate.name,
      groups: [],
      total: 0,
    };
  }),
});
