import { useEffect, useState } from 'react';

import {
  DataSourceDTO,
  DataSourceDraft,
  useCreateDataSources,
  useListDataSources,
} from '@data-quality/codegen';
import { v4 as uuidv4 } from 'uuid';

export type DataModelOptions = {
  dataModelId: string;
  dataModelSpace: string;
  dataModelVersion: string;
};

type LoadDataSourceOptions = {
  dataModelOptions: DataModelOptions;
  onError: (error: any) => void;
};

/** Load a data source by using the data model id, data model space and data model version.
 *
 * If there is no data source matching the given params, then create a new data source. */
export const useLoadDataSource = (
  options: LoadDataSourceOptions
): {
  dataSource: DataSourceDTO | null;
  loadingDataSource: boolean;
} => {
  const [dataSource, setDataSource] = useState<DataSourceDTO | null>(null);

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

  const loadingDataSource = dataSourcesLoading || createLoading;

  useEffect(() => {
    const loadDataSource = async ({
      dataModelOptions,
      onError,
    }: LoadDataSourceOptions) => {
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
      } catch (error: unknown) {
        onError(error);
      }
    };

    loadDataSource(options);
  });

  return { dataSource, loadingDataSource };
};

/** Looks for a data source that matches the given data model id, data mode space and data model version in a list of data sources. */
const findDataSource = (
  dataModelOptions: DataModelOptions,
  dataSources?: DataSourceDTO[]
) => {
  const { dataModelId, dataModelSpace, dataModelVersion } = dataModelOptions;

  return dataSources?.find(
    (ds) =>
      ds.dataModelId === dataModelId &&
      ds.dataModelSpaceId === dataModelSpace &&
      ds.dataModelVersion === dataModelVersion
  );
};
