import {
  DataModel,
  DataModelVersion,
  PlatypusError,
} from '@platypus/platypus-core';
import { useQuery } from '@tanstack/react-query';

import { useDMContext } from '../context/DMContext';
import { TOKENS } from '../di';
import { apiCommandFuncWrapper } from '../utils/api-callback-wrappers';
import { QueryKeys } from '../utils/queryKeys';

import { useInjection } from './useInjection';

export const useDataModels = () => {
  const dataModelsHandler = useInjection(TOKENS.listDataModelsQuery);

  return useQuery(QueryKeys.DATA_MODEL_LIST, async () =>
    apiCommandFuncWrapper<DataModel[]>(() => dataModelsHandler.execute())
  );
};

export const useDataModel = (dataModelExternalId: string, space: string) => {
  const fetchDataModelQuery = useInjection(TOKENS.fetchDataModelQuery);

  return useQuery(
    QueryKeys.DATA_MODEL(space, dataModelExternalId),
    async () =>
      await apiCommandFuncWrapper<DataModel>(() =>
        fetchDataModelQuery.execute({
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
  const fetchDataModelVersionsQuery = useInjection(
    TOKENS.fetchDataModelVersionsQuery
  );

  return useQuery<DataModelVersion[], PlatypusError>(
    QueryKeys.DATA_MODEL_VERSION_LIST(space, dataModelExternalId),
    async () =>
      await apiCommandFuncWrapper<DataModelVersion[]>(() =>
        fetchDataModelVersionsQuery.execute({
          externalId: dataModelExternalId || '',
          space,
        })
      )
  );
};

export const useCustomTypeNames = () => {
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );

  const { typeDefs } = useDMContext();

  return dataModelTypeDefsBuilder.getCustomTypesNames(typeDefs);
};
