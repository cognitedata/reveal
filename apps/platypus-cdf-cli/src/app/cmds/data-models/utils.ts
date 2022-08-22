import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  DataModelsHandler,
  DmsApiService,
  DataModelVersionHandler,
  MixerApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const getMixerApiService = () => {
  const client = getCogniteSDKClient();
  return new MixerApiService(client);
};

export const getDataModelStorageApiService = () => {
  const client = getCogniteSDKClient();
  return new DmsApiService(client);
};

export const getDataModelsHandler = () => {
  return new DataModelsHandler(
    getMixerApiService(),
    getDataModelStorageApiService()
  );
};

export const getDataModelVersionsHandler = () => {
  return new DataModelVersionHandler(
    getMixerApiService(),
    getDataModelStorageApiService(),
    new GraphQlUtilsService()
  );
};
