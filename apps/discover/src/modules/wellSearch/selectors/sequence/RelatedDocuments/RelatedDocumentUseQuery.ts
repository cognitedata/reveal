import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';

import { getTenantInfo } from '@cognite/react-container';
import { DocumentsFilter } from '@cognite/sdk-playground';

import {
  LOG_RELATED_DOCUMENTS,
  LOG_WELLS_RELATED_DOCUMENTS,
} from 'constants/logging';
import { RELATED_DOCUMENT_KEY } from 'constants/react-query';
import {
  TimeLogStages,
  useGetCogniteMetric,
  useStartTimeLogger,
  useStopTimeLogger,
} from 'hooks/useTimeLog';
import { SavedSearchContent } from 'modules/api/savedSearches/types';
import { createSavedSearch } from 'modules/api/savedSearches/utils';
import { getJsonHeaders } from 'modules/api/service';
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
  useSelectedOrHoveredWellboreIds,
  useSelectedOrHoveredWellbores,
  useWellboreAssetIdMap,
} from '../../asset/wellbore';

import { useRelatedDocumentFilterQuery } from './useRelatedDocumentFilterQuery';
import { getDocumentConfig, getMergedFacets } from './utils';

export const SAVED_RELATED_DOCUMENTS = 'savedRelatedDocuments';
const SELECTED_WELLBORES_RELATED_DOCUMENTS =
  'SELECTED_WELLBORES_RELATED_DOCUMENTS';

const RELATED_DOCUMENTS_AGGREGATES = {
  labels: 'RELATED_DOCUMENTS_LABELS_AGGREGATE',
  filetype: 'RELATED_DOCUMENTS_FILE_TYPE_AGGREGATE',
  location: 'RELATED_DOCUMENTS_LOCATION_AGGREGATE',
  lastcreated: 'RELATED_DOCUMENTS_LASTCREATED_AGGREGATE',
  lastUpdatedTime: 'RELATED_DOCUMENTS_LASTUPDATED_AGGREGATE',
  pageCount: 'RELATED_DOCUMENTS_PAGECOUNT_AGGREGATE',
};

const useWellboresRelatedDocumentsCategories =
  (): UseQueryResult<DocumentResultFacets> => {
    const selectedOrHoveredWellbores = useSelectedOrHoveredWellbores();
    const wellboreAssetIdMap = useWellboreAssetIdMap();
    const wellboreAssetIds = selectedOrHoveredWellbores.map(
      (row) => wellboreAssetIdMap[row.id]
    );
    return useQuery<DocumentResultFacets>(
      [SELECTED_WELLBORES_RELATED_DOCUMENTS, wellboreAssetIds],
      () => documentSearchService.getCategoriesByAssetIds(wellboreAssetIds)
    );
  };

const useRelatedDocumentsCategories = (
  filterQuery: SearchQueryFull,
  filters: DocumentsFilter,
  category: AggregateNames
): UseQueryResult<CategoryResponse> => {
  const query = {
    ...filterQuery,
    facets: { ...filterQuery.facets, [category]: [] },
  };
  return useQuery<CategoryResponse>(
    [RELATED_DOCUMENTS_AGGREGATES[category], query, filters],
    () => documentSearchService.getCategoriesByQuery(query, filters, category),
    {
      enabled: filterQuery.facets[category as DocumentFacet].length > 0,
    }
  );
};
// query related document data
export const useQuerySavedRelatedDocuments = (
  limit = 100
): UseQueryResult<DocumentResult> => {
  const metric = useGetCogniteMetric(LOG_RELATED_DOCUMENTS);
  const filterQuery = useRelatedDocumentFilterQuery();
  const wellboreIds = useSelectedOrHoveredWellboreIds();
  const wellboreAssetIdMap = useWellboreAssetIdMap();
  const { filters } = getDocumentConfig(
    wellboreIds.map((id) => wellboreAssetIdMap[id])
  );
  const { data: wellboresFacets } = useWellboresRelatedDocumentsCategories();

  /** **************** Get master response applying all filters ***************** */
  const mainResponse = useQuery<DocumentResult>(
    [SAVED_RELATED_DOCUMENTS, filterQuery, filters],
    () => {
      const networkTimer = useStartTimeLogger(
        TimeLogStages.Network,
        metric,
        LOG_WELLS_RELATED_DOCUMENTS
      );
      const filterOptions = {
        filters,
        sort: [],
      };
      const response = documentSearchService.search(
        filterQuery,
        filterOptions,
        limit
      );
      useStopTimeLogger(networkTimer);
      return response;
    }
  );

  /** **************** Get aggregates for labels if any selected ***************** */
  const { data: labelResponse } = useRelatedDocumentsCategories(
    filterQuery,
    filters,
    'labels'
  );

  /** **************** Get aggregates for filetype if any selected ***************** */
  const { data: filetypeResponse } = useRelatedDocumentsCategories(
    filterQuery,
    filters,
    'filetype'
  );

  /** **************** Get aggregates for location if any selected ***************** */
  const { data: locationResponse } = useRelatedDocumentsCategories(
    filterQuery,
    filters,
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

  const headers = getJsonHeaders();
  const [tenant] = getTenantInfo();

  return useMutation(
    async (props: SavedSearchContent) => {
      await createSavedSearch({
        values: props,
        name: RELATED_DOCUMENT_KEY,
        headers,
        tenant,
      });
      // if the saved search returns an error, we still need the filters to work properly
      // hence returning a new promise with the filters
      return new Promise<SavedSearchContent>((resolve) => {
        resolve(props);
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
