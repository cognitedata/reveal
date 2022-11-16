import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  DataModelsHandler,
  DmsApiService,
  DataModelVersionHandler,
  MixerApiService,
  TransformationApiService,
  FdmV2Client,
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

export const getTransformationsApiService = () => {
  const client = getCogniteSDKClient();
  return new TransformationApiService(client);
};

export const getFlexibleDataModelingClient = () => {
  // refactor this part after implementing client switching logic
  return new FdmV2Client(
    getMixerApiService(),
    getDataModelStorageApiService(),
    getTransformationsApiService(),
    new GraphQlUtilsService()
  );
};

export const getDataModelsHandler = () => {
  return new DataModelsHandler(getFlexibleDataModelingClient());
};

export const getDataModelVersionsHandler = () => {
  return new DataModelVersionHandler(
    getFlexibleDataModelingClient(),
    new GraphQlUtilsService()
  );
};
