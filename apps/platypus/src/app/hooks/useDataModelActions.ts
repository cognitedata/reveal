import { TOKENS } from '@platypus-app/di';
import { useQuery } from '@tanstack/react-query';
import { useInjection } from './useInjection';
import { Notification } from '@platypus-app/components/Notification/Notification';
import {
  DataModel,
  DataModelVersion,
  DataModelVersionStatus,
  Result,
} from '@platypus/platypus-core';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useErrorLogger } from './useErrorLogger';
import { useMemo } from 'react';
import { QueryKeys } from '@platypus-app/utils/queryKeys';

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
    QueryKeys.DATA_MODEL(dataModelExternalId),
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

  return useQuery(
    QueryKeys.DATA_MODEL_VERSION_LIST(dataModelExternalId),
    async () =>
      await dataModelHandlerFuncWrapper<DataModelVersion[]>(() =>
        dataModelVersionHandler.versions({
          externalId: dataModelExternalId || '',
          space,
        })
      )
  );
};

/*
Given an array of data model versions, return a data model version based on the given
version number which could be a number or an alias like "latest". If no versions exist,
return a default.
*/
export const useSelectedDataModelVersion = (
  selectedVersionNumber: string,
  dataModelVersions: DataModelVersion[],
  dataModelExternalId: string,
  space: string
): DataModelVersion => {
  // if no published versions, return a default
  if (!dataModelVersions?.length) {
    return {
      schema: '',
      space,
      // TODO do we really need dataModelExternalId here?
      externalId: dataModelExternalId,
      status: DataModelVersionStatus.DRAFT,
      version: '1',
      createdTime: Date.now(),
      lastUpdatedTime: Date.now(),
    };
  }

  // if version number is "latest"
  if (selectedVersionNumber === DEFAULT_VERSION_PATH) {
    return dataModelVersions[0];
  } else {
    // else find matching version number
    return dataModelVersions.find(
      (schema) => schema.version === selectedVersionNumber
    ) as DataModelVersion;
  }
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
  const { data: dataModelVersions } = useDataModelVersions(
    dataModelExternalId,
    space
  );
  const { data: dataModel } = useDataModel(dataModelExternalId, space);

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );

  const memoizedDataModelTypeDefs = useMemo(() => {
    try {
      const dataModelTypeDefs = dataModelTypeDefsBuilder.parseSchema(
        selectedDataModelVersion.schema
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
