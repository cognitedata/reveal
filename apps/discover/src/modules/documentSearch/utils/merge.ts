import concat from 'lodash/concat';
import groupBy from 'lodash/groupBy';
import { mergeUniqueArray } from 'utils/merge';

import { DocumentSearchResponse } from '@cognite/sdk';

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
        mergedResult?.aggregates,
        result?.aggregates
      ),
    };
  }, emptyDocumentResult);
};

const mergeDocumentsAggregates = (
  previousAggregates: DocumentSearchResponse['aggregates'],
  newAggregates: DocumentSearchResponse['aggregates']
): DocumentSearchResponse['aggregates'] => {
  return previousAggregates?.map((aggregate) => {
    const newAggregate = newAggregates?.find(
      (agg) => agg.name === aggregate.name
    );

    if (!newAggregate) {
      return aggregate;
    }

    return {
      ...aggregate,
      total: aggregate.total + newAggregate.total,
      groups: concat(aggregate.groups, newAggregate.groups),
    };
  });
};
