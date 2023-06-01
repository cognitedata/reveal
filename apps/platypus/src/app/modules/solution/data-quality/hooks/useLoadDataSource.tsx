import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  DataSourceDto,
  DataSourceDraft,
  useCreateDataSources,
  useListDataSources,
} from '@data-quality/codegen';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { v4 as uuidv4 } from 'uuid';

type DataModelOptions = {
  dataModelId: string;
  dataModelSpace: string;
  dataModelVersion: string;
};

type LoadDataSourceOptions = {
  onError: (error: any) => void;
};

/** Load a data source by using the data model id, data model space and data model version.
 *
 * If there is no data source matching the given params, then create a new data source. */
export const useLoadDataSource = (): {
  dataSource?: DataSourceDto;
  error: any;
  loadingDataSource: boolean;
} => {
  const [dataSource, setDataSource] = useState<DataSourceDto>();
  const [error, setError] = useState();

  const {
    data: dataSourcesData,
    error: dataSourcesError,
    isLoading: dataSourcesLoading,
    refetch,
  } = useListDataSources({});

  const {
    isLoading: createLoading,
    mutateAsync: createDataSource,
    status: createStatus,
  } = useCreateDataSources({});

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

  const loadingDataSource = dataSourcesLoading || createLoading;

  useEffect(() => {
    const loadDataSource = async ({ onError }: LoadDataSourceOptions) => {
      try {
        // Start looking for a data source when we have the list of all datasources
        if (dataSourcesLoading) return;

        if (dataSourcesError) {
          onError(dataSourcesError);
          return;
        }

        // Try to find an existing data source in the list
        const existingDataSource = findDataSource(
          dataModelOptions,
          dataSourcesData?.items
        );

        // Found an existing data source
        if (existingDataSource) {
          setDataSource(existingDataSource);
          return;
        }

        const { dataModelId, dataModelSpace, dataModelVersion } =
          dataModelOptions;

        // No existing data source found. Create a new one with the given params
        if (!existingDataSource && createStatus === 'idle') {
          const externalId = uuidv4();

          const newDataSource: DataSourceDraft = {
            externalId,
            dataModelId: dataModelId,
            dataModelSpaceId: dataModelSpace,
            dataModelVersion,
          };

          const createdDataSource = await createDataSource(
            {
              body: {
                items: [newDataSource],
              },
            },
            { onSuccess: () => refetch() }
          );

          setDataSource(createdDataSource.items[0]);
        }
      } catch (err: unknown) {
        onError(err);
      }
    };

    loadDataSource({
      onError: (err) => {
        setError(err);
        Notification({
          type: 'error',
          message: `Couldn't load data source. ${err?.message}`,
          errors: JSON.stringify(err?.stack?.error),
        });
      },
    });
  });

  return { dataSource, error, loadingDataSource };
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
