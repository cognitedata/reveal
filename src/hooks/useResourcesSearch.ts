import sdk from '@cognite/cdf-sdk-singleton';
import { useTranslation } from 'common/i18n';
import { useQuery } from 'react-query';
import { handleError } from 'utils';

type ResourceSearchParams = {
  filter: {
    dataSetIds: Array<{ id: number }>;
  };
  search?: {
    query?: string;
    name?: string;
    description?: string;
  };
};

export type ResourcesFilters = {
  externalIdPrefix?: string;
};

const getResourceSearchParams = (
  dataSetId: number,
  query: string,
  filters: ResourcesFilters,
  prop?: 'query' | 'name' | 'description'
): ResourceSearchParams => {
  const params: ResourceSearchParams = {
    filter: {
      dataSetIds: [{ id: dataSetId }],
      ...filters,
    },
  };
  if (query.length > 0) {
    params.search = {
      [prop || 'query']: query,
    };
  }
  return params;
};

const getResourceSearchQueryKey = (
  resource: string,
  dataSetId: number,
  query: string,
  filters: ResourcesFilters
) => [resource, 'search', dataSetId, query, filters];

type TResourcesSearch = {
  dataSetId: number;
  query: string;
  filters: ResourcesFilters;
};

export const useResourcesSearch = ({
  dataSetId,
  query,
  filters,
}: TResourcesSearch) => {
  const { t } = useTranslation();

  const assets = useQuery(
    getResourceSearchQueryKey('assets', dataSetId, query, filters),
    () => sdk.assets.search(getResourceSearchParams(dataSetId, query, filters)),
    {
      onError: (e: any) => {
        handleError({ message: t('assets-failed-to-fetch'), ...e });
      },
    }
  );

  const events = useQuery(
    getResourceSearchQueryKey('events', dataSetId, query, filters),
    () =>
      sdk.events.search(
        getResourceSearchParams(dataSetId, query, filters, 'description')
      ),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-events-failed'), ...e });
      },
    }
  );

  const files = useQuery(
    getResourceSearchQueryKey('files', dataSetId, query, filters),
    () =>
      sdk.files.search(
        getResourceSearchParams(dataSetId, query, filters, 'name')
      ),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-files-failed'), ...e });
      },
    }
  );

  const sequences = useQuery(
    getResourceSearchQueryKey('sequences', dataSetId, query, filters),
    () =>
      sdk.sequences.search(getResourceSearchParams(dataSetId, query, filters)),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-sequences-failed'), ...e });
      },
    }
  );

  const timeseries = useQuery(
    getResourceSearchQueryKey('timeseries', dataSetId, query, filters),
    () =>
      sdk.timeseries.search(getResourceSearchParams(dataSetId, query, filters)),
    {
      onError: (e: any) => {
        handleError({ message: t('fetch-timeseries-failed'), ...e });
      },
    }
  );

  return { assets, events, files, sequences, timeseries };
};
