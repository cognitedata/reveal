import concat from 'lodash/concat';
import groupBy from 'lodash/groupBy';
import { mergeUniqueArray } from 'utils/merge';

import { DocumentsAggregate } from '@cognite/sdk-playground';

import {
  AggregateNames,
  DocumentQueryFacet,
  DocumentResult,
  DocumentResultFacets,
} from '../types';

import { getEmptyDocumentResult, getEmptyDocumentStateFacets } from './utils';

export const mergeDocumentResultFacets = (
  documentResultFacets: DocumentResultFacets[]
): DocumentResultFacets => {
  const emptyDocumentResultFacets = getEmptyDocumentStateFacets();

  return documentResultFacets.reduce((mergedFacets, resultFacets) => {
    return Object.keys(resultFacets).reduce(
      (summingResultFacets, aggregateName) => {
        const queryFacets: DocumentQueryFacet[] = concat(
          mergedFacets[aggregateName as AggregateNames] || [],
          resultFacets[aggregateName as AggregateNames]
        );
        const groupedQueryFacets = groupBy(queryFacets, 'name');

        return {
          ...summingResultFacets,
          [aggregateName]: Object.keys(groupedQueryFacets).map((name) => {
            return groupedQueryFacets[name].reduce(
              mergeUniqueArray,
              {} as DocumentQueryFacet
            );
          }),
        };
      },
      emptyDocumentResultFacets
    );
  }, emptyDocumentResultFacets);
};

export const mergeDocumentResults = (
  documentResults: DocumentResult[]
): DocumentResult => {
  const emptyDocumentResult = getEmptyDocumentResult();

  return documentResults.reduce((mergedResult, result) => {
    return {
      count: Number(mergedResult.count) + Number(result.count),
      hits: concat(mergedResult.hits, result.hits),
      facets: mergeDocumentResultFacets(
        concat(mergedResult.facets, result.facets)
      ),
      aggregates: mergeDocumentsAggregates(
        concat(mergedResult.aggregates || [], result.aggregates || [])
      ),
    };
  }, emptyDocumentResult);
};

export const mergeDocumentsAggregates = (
  documentsAggregates: DocumentsAggregate[]
): DocumentsAggregate[] => {
  const groupedDocumentsAggregates = groupBy(documentsAggregates, 'name');

  return Object.keys(groupedDocumentsAggregates).reduce(
    (result, aggregateName) => {
      return [
        ...result,
        groupedDocumentsAggregates[aggregateName].reduce(
          (mergedAggregate, aggregate) => {
            return {
              name: aggregate.name,
              groups: concat(mergedAggregate.groups, aggregate.groups),
              total: mergedAggregate.total + Number(aggregate.total),
            };
          },
          {
            name: '',
            groups: [],
            total: 0,
          } as DocumentsAggregate
        ),
      ];
    },
    [] as DocumentsAggregate[]
  );
};
