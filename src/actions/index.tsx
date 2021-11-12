import React, { useEffect, useState } from 'react';
import handleError from 'utils/handleError';
import omit from 'lodash/omit';
import { CreationDataSet, DataSet, TransformationDetails } from 'utils/types';
import { DataSetPatch, Group } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { useWithIntegrations } from 'hooks/useWithIntegrations';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { notification, Typography } from 'antd';
import {
  getAllSetOwners,
  parseDataSet,
  parseDataSetsList,
  stringifyMetaData,
  updateDataSetOwners,
  wait,
} from 'utils/utils';
import {
  fetchIntegrationsByDataSetId,
  getExtractionPipelineApiUrl,
  mapDataSetIntegration,
} from 'utils/integrationUtils';
import {
  getRetrieveByDataSetIdKey,
  getDataSetOwnersByIdKey,
  listRawDatabasesKey,
  listRawTablesKey,
  listGroupsKey,
  getListDatasetsKey,
} from './keys';

export const invalidateDataSetQueries = (
  client: QueryClient,
  id?: number,
  waitLonger?: boolean
) => {
  const invalidate = () => {
    client.invalidateQueries(getListDatasetsKey());
    client.invalidateQueries(listGroupsKey);
    if (id) {
      client.invalidateQueries(getRetrieveByDataSetIdKey(String(id)));
      client.invalidateQueries(getDataSetOwnersByIdKey(String(id)));
    }
  };

  // Avoid eventual consistency
  // the longer wait is needed for changing owners so that the fetch request doesn't return a 401
  wait(waitLonger ? 4000 : 2000)
    .then(() => invalidate())
    .catch(() => invalidate());
};

export const onError = (error: any) => {
  handleError({ ...error });
};

/* MUTATIONS */
export const useCreateDataSetMutation = () => {
  const client = useQueryClient();

  const {
    mutate: createDataSet,
    data: createdDataSetId,
    ...rest
  } = useMutation(
    'data-set-creation',
    async (dataset: CreationDataSet) => {
      const res = await sdk.datasets.create([stringifyMetaData(dataset)]);
      return res[0].id as number;
    },
    {
      onSuccess: () => invalidateDataSetQueries(client),
      onError,
    }
  );
  return { createDataSet, createdDataSetId, ...rest };
};

export const useUpdateDataSetOwners = () => {
  const client = useQueryClient();
  const { mutate: updateOwners, ...rest } = useMutation(
    'update-owners',
    async (options: { owners: Group[]; dataSetId: number }) => {
      await updateDataSetOwners(options.dataSetId, options.owners);
      invalidateDataSetQueries(client, options.dataSetId, true);
    },
    {
      onError,
    }
  );
  return { updateOwners, ...rest };
};

export const useUpdateDataSetMutation = () => {
  const client = useQueryClient();
  const { mutate: updateDataSet, ...rest } = useMutation(
    'update-dataset',
    async (dataset: DataSet) => {
      const updatedDataSet = omit(dataset, [
        'id',
        'createdTime',
        'lastUpdatedTime',
      ]);
      const updateObj: DataSetPatch['update'] = {};

      Object.keys(updatedDataSet).forEach((key) => {
        // @ts-ignore
        updateObj[key] = { set: stringifyMetaData(dataset)[key] };
      });

      const [updateResponse] = await sdk.datasets.update([
        { update: updateObj, id: dataset.id },
      ]);

      return parseDataSet(updateResponse);
    },
    {
      onSuccess: (_, dataset: DataSet) => {
        notification.success({
          message: <p>Data set &quot;{dataset?.name}&quot; is updated</p>,
        });
      },
      onError: (error: any, dataset: DataSet) => {
        notification.error({
          message: (
            <>
              <p>Data set &quot;{dataset?.name}&quot; is not updated</p>
              <Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>
                <pre>{JSON.stringify(error.errors, null, 2)}`</pre>
              </Typography.Paragraph>
            </>
          ),
          key: 'update-data-set-mutation',
        });
      },
      onSettled: (_, __, dataset: DataSet) => {
        invalidateDataSetQueries(client, dataset.id);
      },
    }
  );
  return { updateDataSet, ...rest };
};

export const useUpdateDataSetTransformations = () => {
  const { updateDataSet, ...rest } = useUpdateDataSetMutation();

  const updateDataSetTransformations = async (
    dataset: DataSet,
    transformation: TransformationDetails
  ) => {
    const newDataSet = { ...dataset };
    newDataSet.metadata.transformations =
      newDataSet.metadata.transformations?.filter(
        (currentTransformation) => currentTransformation !== transformation
      );

    updateDataSet(newDataSet);
  };

  return { updateDataSetTransformations, ...rest };
};

export const useUpdateDataSetVisibility = () => {
  const { updateDataSet, ...rest } = useUpdateDataSetMutation();

  const updateDataSetVisibility = async (
    dataset: DataSet,
    archive: boolean
  ) => {
    const newDataSet = { ...dataset };
    newDataSet.metadata.archived = archive;
    updateDataSet(newDataSet);
  };
  return { updateDataSetVisibility, ...rest };
};

/* QUERIES */

export const useDataSetsList = (): {
  dataSets?: DataSet[];
  error: any;
  isLoading: boolean;
} => {
  const { data: withIntegrations, isFetched: didFetchWithIntegrations } =
    useWithIntegrations();
  const { data: dataSets, ...rest } = useQuery(
    getListDatasetsKey(withIntegrations),
    async () => {
      const newDataSets = await sdk.datasets
        .list()
        .autoPagingToArray({ limit: -1 });
      if (withIntegrations) {
        const integrations = await sdk.get(
          getExtractionPipelineApiUrl(sdk.project),
          {
            withCredentials: true,
          }
        );
        return mapDataSetIntegration(
          parseDataSetsList(newDataSets),
          integrations?.data?.items ?? []
        );
      }
      return parseDataSetsList(newDataSets);
    },
    { enabled: didFetchWithIntegrations, onError }
  );

  return { dataSets, ...rest };
};

export const useDataSet = (id?: number) => {
  const { data: withIntegrations, isFetched: didFetchWithIntegrations } =
    useWithIntegrations();

  const { data: dataSet, ...rest } = useQuery(
    getRetrieveByDataSetIdKey(String(id), withIntegrations),
    // eslint-disable-next-line consistent-return
    async () => {
      if (id) {
        const [resDataSet] = await sdk.datasets.retrieve([{ id }]);
        let integrations;

        if (withIntegrations) {
          integrations = await fetchIntegrationsByDataSetId(id);
        }
        const parsedDataSet = parseDataSet(resDataSet);

        return {
          ...parsedDataSet,
          metadata: {
            ...parsedDataSet.metadata,
            integrations,
          },
        };
      }
    },
    { onError, enabled: !!id && didFetchWithIntegrations }
  );

  return { dataSet, ...rest };
};

export const useDataSetOwners = (
  id?: number
): { owners: Group[]; isLoading: boolean; error: any } => {
  const { data: owners, ...rest } = useQuery(
    getDataSetOwnersByIdKey(String(id)),
    () => (id ? getAllSetOwners(id) : []),
    { onError, enabled: !!id }
  );
  return { owners: owners as Group[], ...rest };
};

export const useRawList = () => {
  const {
    data: databases,
    isLoading: isLoadingDatabases,
    error: errorDatabases,
  } = useQuery(listRawDatabasesKey, () =>
    sdk.raw.listDatabases().autoPagingToArray({ limit: -1 })
  );
  const {
    data: tables = [],
    isLoading: isLoadingTables,
    error: errorTables,
  } = useQuery(
    listRawTablesKey,
    // eslint-disable-next-line consistent-return
    () => {
      if (databases) {
        const tablePromises = databases.map((database) =>
          sdk.raw
            .listTables(database.name)
            .autoPagingToArray({ limit: -1 })
            .then((res) => ({ database, tables: res }))
        );
        return Promise.all(tablePromises);
      }
    },
    { enabled: !!databases?.length }
  );

  return {
    databases,
    tables,
    isLoading: isLoadingDatabases || isLoadingTables,
    error: errorDatabases || errorTables,
  };
};

export const useLabelSuggestions = () => {
  const { dataSets, ...rest } = useDataSetsList();
  const [labels, setLabels] = useState<Array<string>>([]);

  useEffect(() => {
    if (dataSets) {
      const suggestedLabels = dataSets.reduce(
        (acc: { [label: string]: string }, cur) => {
          // eslint-disable-next-line no-unused-expressions
          cur?.metadata?.consoleLabels?.forEach((label) => {
            acc[label] = label;
          });
          return acc;
        },
        {}
      );
      setLabels(Object.keys(suggestedLabels));
    }
  }, [dataSets]);

  return { labels, ...rest };
};

export const useCdfGroups = () => {
  const { data: groups, ...rest } = useQuery(listGroupsKey, () =>
    sdk.groups.list({ all: true })
  );
  return { groups, ...rest };
};
