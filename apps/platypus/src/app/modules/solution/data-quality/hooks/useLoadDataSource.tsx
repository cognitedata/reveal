import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  DataSourceDto,
  DataSourceDraft,
  useCreateDataSources,
  useListDataSources,
} from '@data-quality/api/codegen';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';

/** Encapsulate data model id, data model space and data model version. */
type DataModelOptions = {
  dataModelId: string;
  dataModelSpace: string;
  dataModelVersion: string;
};

type CreateDataSourceOptions = {
  onError: (error: any) => void;
};

/** Load a data source by using the data model id, data model space and data model version.
 *
 * If there is no data source matching the given params, then create a new data source. */
export const useLoadDataSource = (): {
  dataSource?: DataSourceDto;
  error: any;
  isLoading: boolean;
} => {
  const queryClient = useQueryClient();

  const { t } = useTranslation('useLoadDataSource');

  const {
    data: dataSourcesData,
    error: dataSourcesError,
    isLoading: dataSourcesLoading,
    isRefetching: dataSourcesRefetching,
    refetch,
  } = useListDataSources({});

  const {
    isLoading: createDataSourceLoading,
    mutateAsync: createDataSourceMutation,
    status: createDataSourceStatus,
  } = useCreateDataSources({ mutationKey: ['createDataSource'] });

  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };
  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  const dataModelOptions: DataModelOptions = {
    dataModelId: dataModelExternalId,
    dataModelSpace: space,
    dataModelVersion: selectedDataModelVersion.version,
  };

  const isLoading = dataSourcesLoading || createDataSourceLoading;

  useEffect(() => {
    const createDataSource = async ({ onError }: CreateDataSourceOptions) => {
      try {
        const { dataModelId, dataModelSpace, dataModelVersion } =
          dataModelOptions;

        // No existing data source found. Create a new one with the given params
        if (createDataSourceStatus === 'idle') {
          const externalId = uuidv4();

          const newDataSource: DataSourceDraft = {
            externalId,
            dataModelId: dataModelId,
            dataModelSpaceId: dataModelSpace,
            dataModelVersion,
          };

          await createDataSourceMutation(
            {
              body: {
                items: [newDataSource],
              },
            },
            { onSuccess: () => refetch() }
          );
        }
      } catch (err: unknown) {
        onError(err);
      }
    };

    // Start looking for a data source when we have the list of all datasources
    if (dataSourcesLoading || dataSourcesError || dataSourcesRefetching) return;

    // Try to find an existing data source in the fetched list
    const existingDataSource = findDataSource(
      dataModelOptions,
      dataSourcesData?.items
    );
    if (existingDataSource) return;

    // Check if the createDataSource mutation is in use
    const creatingDataSource = queryClient.isMutating({
      mutationKey: ['createDataSource'],
    });
    if (creatingDataSource) return;

    // No data source found, try to create it
    createDataSource({
      onError: (err) => {
        Notification({
          type: 'error',
          message: t(
            'data_quality_not_found_ds',
            'Something went wrong. The data source could not be loaded.'
          ),
          errors: JSON.stringify(err?.stack?.error),
        });
      },
    });
  });

  const dataSource = findDataSource(dataModelOptions, dataSourcesData?.items);

  return { dataSource, error: dataSourcesError, isLoading };
};

/** Looks for a data source that matches the given data model id, data mode space and data model version in a list of data sources. */
const findDataSource = (
  dataModelOptions: DataModelOptions,
  dataSources?: DataSourceDto[]
) => {
  const { dataModelId, dataModelSpace, dataModelVersion } = dataModelOptions;

  return dataSources?.find(
    (ds) =>
      ds.dataModelId === dataModelId &&
      ds.dataModelSpaceId === dataModelSpace &&
      ds.dataModelVersion === dataModelVersion
  );
};
