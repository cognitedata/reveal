import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';

import isEmpty from 'lodash/isEmpty';
import { adaptSaveSearchContentToSchemaBody } from 'services/savedSearches/adaptSavedSearch';
import { SavedSearchContent } from 'services/savedSearches/types';
import { discoverAPI, useJsonHeaders } from 'services/service';
import { mergeUniqueArray } from 'utils/merge';

import { getTenantInfo } from '@cognite/react-container';
import { reportException } from '@cognite/react-errors';
import { DocumentsFilter } from '@cognite/sdk-playground';

import {
  LOG_RELATED_DOCUMENTS,
  LOG_WELLS_RELATED_DOCUMENTS,
} from 'constants/logging';
import { RELATED_DOCUMENT_KEY } from 'constants/react-query';
import { TimeLogStages, useMetricLogger } from 'hooks/useTimeLog';
import { documentSearchService } from 'modules/documentSearch/service';
import {
  AggregateNames,
  DocumentFacet,
  DocumentResult,
  DocumentResultFacets,
  SearchQueryFull,
  CategoryResponse,
} from 'modules/documentSearch/types';
import {
  useWellInspectSelectedWellboreIds,
  useWellInspectSelectedWellbores,
} from 'modules/wellInspect/hooks/useWellInspect';
import { useWellInspectWellboreAssetIdMap } from 'modules/wellInspect/hooks/useWellInspectIdMap';
import { useEnabledWellSdkV3 } from 'modules/wellSearch/hooks/useEnabledWellSdkV3';

import { useRelatedDocumentFilterQuery } from './useRelatedDocumentFilterQuery';
import { formatAssetIdsFilter, getMergedFacets } from './utils';

export const SAVED_RELATED_DOCUMENTS = 'savedRelatedDocuments';
const SELECTED_WELLBORES_RELATED_DOCUMENTS =
  'SELECTED_WELLBORES_RELATED_DOCUMENTS';

const RELATED_DOCUMENTS_AGGREGATES = {
  labels: 'RELATED_DOCUMENTS_LABELS_AGGREGATE',
  filetype: 'RELATED_DOCUMENTS_FILE_TYPE_AGGREGATE',
  location: 'RELATED_DOCUMENTS_LOCATION_AGGREGATE',
  lastcreated: 'RELATED_DOCUMENTS_LASTCREATED_AGGREGATE',
  total: 'RELATED_DOCUMENTS_TOTAL_AGGREGATE',
  pageCount: 'RELATED_DOCUMENTS_PAGECOUNT_AGGREGATE',
};

const useWellboresRelatedDocumentsCategories =
  (): UseQueryResult<DocumentResultFacets> => {
    const selectedWellbores = useWellInspectSelectedWellbores();
    const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();

    const wellboreAssetIds = selectedWellbores.map(
      (row) => wellboreAssetIdMap[row.id]
    );
    const isV3Enabled = useEnabledWellSdkV3();

    const batchedFilters = formatAssetIdsFilter(wellboreAssetIds, isV3Enabled);

    return useQuery<DocumentResultFacets>(
      [
        SELECTED_WELLBORES_RELATED_DOCUMENTS,
        wellboreAssetIds,
        ...batchedFilters,
      ],
      async () => {
        const results = await Promise.all(
          batchedFilters.map(async ({ filters }) =>
            documentSearchService.getCategoriesByAssetIds(filters)
          )
        );

        return results.reduce((acc, item) => {
          return mergeUniqueArray(acc, item);
        }, {} as DocumentResultFacets);
      },
      {
        enabled: isV3Enabled !== undefined && !isEmpty(batchedFilters),
      }
    );
  };

const useRelatedDocumentsCategories = (
  filterQuery: SearchQueryFull,
  batchedFilters: { filters: DocumentsFilter }[],
  category: AggregateNames
): UseQueryResult<CategoryResponse> => {
  const query = {
    ...filterQuery,
    facets: { ...filterQuery.facets, [category]: [] },
  };
  return useQuery<CategoryResponse>(
    [RELATED_DOCUMENTS_AGGREGATES[category], query, ...batchedFilters],
    async () => {
      const results = await Promise.all(
        batchedFilters.map(({ filters }) => {
          return documentSearchService.getCategoriesByQuery(
            query,
            filters,
            category
          );
        })
      );

      return results.reduce((acc, item) => {
        return mergeUniqueArray(acc, item);
      }, {} as CategoryResponse);
    },
    {
      enabled:
        filterQuery.facets[category as DocumentFacet].length > 0 &&
        !isEmpty(batchedFilters),
    }
  );
};
// query related document data
export const useQuerySavedRelatedDocuments = (
  limit = 100
): UseQueryResult<DocumentResult> => {
  const [startNetworkTimer, stopNetworkTimer] = useMetricLogger(
    LOG_RELATED_DOCUMENTS,
    TimeLogStages.Network,
    LOG_WELLS_RELATED_DOCUMENTS
  );
  const filterQuery = useRelatedDocumentFilterQuery();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();
  const isV3Enabled = useEnabledWellSdkV3();

  const batchedFilters = formatAssetIdsFilter(
    wellboreIds.map((id) => wellboreAssetIdMap[id]),
    isV3Enabled
  );

  const { data: wellboresFacets } = useWellboresRelatedDocumentsCategories();

  /** **************** Get master response applying all filters ***************** */
  const mainResponse = useQuery<DocumentResult>(
    [SAVED_RELATED_DOCUMENTS, filterQuery, ...batchedFilters],
    async () => {
      startNetworkTimer();

      const results = await Promise.all(
        batchedFilters.map(({ filters }) => {
          const filterOptions = {
            filters,
            sort: [],
          };
          return documentSearchService
            .search(filterQuery, filterOptions, limit)
            .finally(() => {
              stopNetworkTimer();
            });
        })
      );

      return results.reduce((acc, item) => {
        return mergeUniqueArray(acc, item);
      }, {} as DocumentResult);
    },
    {
      enabled: !isEmpty(batchedFilters),
    }
  );

  /** **************** Get aggregates for labels if any selected ***************** */
  const { data: labelResponse } = useRelatedDocumentsCategories(
    filterQuery,
    batchedFilters,
    'labels'
  );

  /** **************** Get aggregates for filetype if any selected ***************** */
  const { data: filetypeResponse } = useRelatedDocumentsCategories(
    filterQuery,
    batchedFilters,
    'filetype'
  );

  /** **************** Get aggregates for location if any selected ***************** */
  const { data: locationResponse } = useRelatedDocumentsCategories(
    filterQuery,
    batchedFilters,
    'location'
  );

  if (mainResponse.data && wellboresFacets) {
    /** **************** Start merging aggregate responses with main resulst ***************** */
    const aggregateResponse = {
      labels: labelResponse,
      filetype: filetypeResponse,
      location: locationResponse,
    };
    Object.entries(aggregateResponse).forEach(([field, column]) => {
      if (column && filterQuery.facets[field as DocumentFacet].length > 0) {
        mainResponse.data.facets[field as AggregateNames] = column.facets;
        if (mainResponse.data.aggregates) {
          mainResponse.data.aggregates = mainResponse.data.aggregates.map(
            (aggregate) =>
              aggregate.name === field
                ? { ...aggregate, total: column.total }
                : aggregate
          );
        }
      }
    });
    mainResponse.data.facets = getMergedFacets(
      wellboresFacets,
      mainResponse.data.facets,
      filterQuery.facets
    );
  }
  return mainResponse;
};

export const useMutateRelatedDocumentPatch = () => {
  const queryClient = useQueryClient();

  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();

  return useMutation(
    async (savedSearchContent: SavedSearchContent) => {
      await discoverAPI.savedSearches
        .create(
          RELATED_DOCUMENT_KEY,
          adaptSaveSearchContentToSchemaBody(savedSearchContent),
          headers,
          tenant
        )
        .catch((error) => reportException(String(error)));

      // if the saved search returns an error, we still need the filters to work properly
      // hence returning a new promise with the filters
      return new Promise<SavedSearchContent>((resolve) => {
        resolve(savedSearchContent);
      });
    },
    {
      onSuccess: (data: SavedSearchContent) => {
        queryClient.setQueryData(RELATED_DOCUMENT_KEY, data);
        queryClient.invalidateQueries(SAVED_RELATED_DOCUMENTS);
      },
    }
  );
};
