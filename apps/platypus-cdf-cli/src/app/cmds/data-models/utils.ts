import {
  DataModelApiFacadeService,
  MixerApiService,
  DataModelVersionHandler,
  DataModelsHandler,
  DataModelStorageApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { GraphQlUtilsService } from '@platypus/platypus-common-utils';

export const getMixerApiService = () => {
  const client = getCogniteSDKClient();
  return new MixerApiService(client);
};

export const getDataModelStorageApiService = () => {
  const client = getCogniteSDKClient();
  return new DataModelStorageApiService(client);
};

export const getDataModelsHandler = () => {
  return new DataModelsHandler(
    new DataModelApiFacadeService(
      getMixerApiService(),
      getDataModelStorageApiService(),
      new GraphQlUtilsService()
    )
  );
};

export const getDataModelVersionsHandler = () => {
  return new DataModelVersionHandler(
    new DataModelApiFacadeService(
      getMixerApiService(),
      getDataModelStorageApiService(),
      new GraphQlUtilsService()
    )
  );
};
