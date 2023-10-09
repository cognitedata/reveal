import { useMemo } from 'react';

import {
  DataModel,
  DataModelVersion,
  PlatypusError,
  Result,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';

import { Notification } from '../components/Notification/Notification';
import { TOKENS } from '../di';
import { QueryKeys } from '../utils/queryKeys';

import { useErrorLogger } from './useErrorLogger';
import { useInjection } from './useInjection';
import { useSelectedDataModelVersion } from './useSelectedDataModelVersion';

async function dataModelHandlerFuncWrapper<T>(
  callableFn: () => Promise<Result<T>>
) {
  const result = await callableFn();
  if (!result.isSuccess) {
    Notification({ type: 'error', message: result.error.message });
    throw result.error;
  }
  return result.getValue();
}

export const useDataModels = () => {
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);

  return useQuery(QueryKeys.DATA_MODEL_LIST, async () =>
    dataModelHandlerFuncWrapper<DataModel[]>(() => dataModelsHandler.list())
  );
};

export const useDataModel = (dataModelExternalId: string, space: string) => {
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);

  return useQuery(
    QueryKeys.DATA_MODEL(space, dataModelExternalId),
    async () =>
      await dataModelHandlerFuncWrapper<DataModel>(() =>
        dataModelsHandler.fetch({
          dataModelId: dataModelExternalId,
          space,
        })
      )
  );
};

export const useDataModelVersions = (
  dataModelExternalId: string,
  space: string
) => {
  const dataModelVersionHandler = useInjection(TOKENS.dataModelVersionHandler);

  return useQuery<DataModelVersion[], PlatypusError>(
    QueryKeys.DATA_MODEL_VERSION_LIST(space, dataModelExternalId),
    async () =>
      await dataModelHandlerFuncWrapper<DataModelVersion[]>(() =>
        dataModelVersionHandler.versions({
          externalId: dataModelExternalId || '',
          space,
        })
      )
  );
};

export const useDataModelTypeDefs = (
  dataModelExternalId: string,
  selectedVersionNumber: string,
  space: string
) => {
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const errorLogger = useErrorLogger();

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(
      selectedVersionNumber,
      dataModelExternalId,
      space
    );

  const memoizedDataModelTypeDefs = useMemo(() => {
    // Do not remove, it fixes really bad bug with stale data
    if (!selectedDataModelVersion.schema) {
      return { types: [] };
    }

    try {
      const dataModelTypeDefs = dataModelTypeDefsBuilder.parseSchema(
        selectedDataModelVersion.schema,
        selectedDataModelVersion.views
      );

      return dataModelTypeDefs;
      // eslint-disable-next-line
    } catch (err: any) {
      errorLogger.log(err);
      Notification({ type: 'error', message: err.message });
    }

    return { types: [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataModelVersion.schema]);

  return memoizedDataModelTypeDefs;
};

export const useCustomTypeNames = (
  dataModelExternalId: string,
  selectedVersionNumber: string,
  space: string
) => {
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    selectedVersionNumber,
    space
  );

  return dataModelTypeDefsBuilder.getCustomTypesNames(dataModelTypeDefs);
};
