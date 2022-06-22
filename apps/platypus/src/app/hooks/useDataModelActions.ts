import { TOKENS } from '@platypus-app/di';
import { useQuery } from 'react-query';
import { useInjection } from './useInjection';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { DataModel, DataModelVersion, Result } from '@platypus/platypus-core';

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

  return useQuery('dataModelsList', async () =>
    dataModelHandlerFuncWrapper<DataModel[]>(() => dataModelsHandler.list())
  );
};

export const useDataModel = (dataModelExternalId: string) => {
  const dataModelsHandler = useInjection(TOKENS.dataModelsHandler);

  return useQuery(
    ['dataModel', dataModelExternalId],
    async () =>
      await dataModelHandlerFuncWrapper<DataModel>(() =>
        dataModelsHandler.fetch({
          dataModelId: dataModelExternalId,
        })
      )
  );
};

export const useDataModelVersions = (dataModelExternalId: string) => {
  const dataModelVersionHandler = useInjection(TOKENS.dataModelVersionHandler);

  return useQuery(
    ['dataModelVersions', dataModelExternalId],
    async () =>
      await dataModelHandlerFuncWrapper<DataModelVersion[]>(() =>
        dataModelVersionHandler.versions({
          dataModelId: dataModelExternalId,
        })
      )
  );
};
