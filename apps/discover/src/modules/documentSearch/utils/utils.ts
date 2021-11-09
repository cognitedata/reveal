// import { DocumentsFilter } from '@cognite/sdk-playground';

import {
  DocumentResultFacets,
  DocumentsFacets,
} from 'modules/documentSearch/types';

//
// ----
//
//  NOTE - slowly start to split the bigger functions out here into files
//
// ----
//

type Refinement = 'OR' | 'EXACT';
export const addQueryRefinement = (field: string, refinement: Refinement) => {
  if (refinement === 'OR') {
    return `(${field.trim()})`;
  }
  if (refinement === 'EXACT') {
    return `'${field.trim()}'`;
  }

  return field;
};

export const getEmptyDocumentStateFacets = (): DocumentResultFacets => ({
  filetype: [],
  labels: [],
  lastcreated: [],
  location: [],
  lastUpdatedTime: [],
  pageCount: [],
});

export const getEmptyFacets = (): DocumentsFacets => ({
  filetype: [],
  labels: [],
  lastmodified: [],
  lastcreated: [],
  location: [],
  pageCount: [],
});

export const getFacets = (
  facets: Partial<DocumentsFacets> = {}
): DocumentsFacets => ({
  ...getEmptyFacets(),
  ...facets,
});

// export const extractFacetsFromDocumentsFilter = (
//   filters: DocumentsFilter
// ): DocumentsFacets => {
//   return {
//     labels:
//       filters?.sourceFile?.labels && 'containsAny' in filters.sourceFile.labels
//         ? filters.sourceFile.labels.containsAny
//         : [],
//     location:
//       filters?.sourceFile?.source && 'in' in filters.sourceFile.source
//         ? filters.sourceFile.source.in
//         : [],
//     filetype: filters?.type && 'in' in filters.type ? filters.type.in : [],
//     lastmodified: filters?.sourceFile?.lastUpdatedTime
//       ? [
//           String(filters.sourceFile.lastUpdatedTime.min),
//           String(filters.sourceFile.lastUpdatedTime.max),
//         ]
//       : [],
//     lastcreated: filters?.sourceFile?.createdTime
//       ? [
//           String(filters.sourceFile.createdTime.min),
//           String(filters.sourceFile.createdTime.max),
//         ]
//       : [],
//   };
// };
