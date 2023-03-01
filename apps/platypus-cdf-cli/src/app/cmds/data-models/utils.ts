import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  DataModelsHandler,
  DmsApiService,
  DataModelVersionHandler,
  MixerApiService,
  TransformationApiService,
  FdmClient,
  FdmMixerApiService,
  SpacesApiService,
  ContainersApiService,
  ViewsApiService,
  DataModelsApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const getMixerApiService = () => {
  const client = getCogniteSDKClient();
  return new MixerApiService(client);
};

export const getFdmV3MixerApiService = () => {
  const client = getCogniteSDKClient();
  return new FdmMixerApiService(client);
};

export const getFdmV3SpacesApiService = () => {
  const client = getCogniteSDKClient();
  return new SpacesApiService(client);
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
  return new FdmClient(
    getFdmV3SpacesApiService(),
    new ContainersApiService(getCogniteSDKClient()),
    new ViewsApiService(getCogniteSDKClient()),
    new DataModelsApiService(getCogniteSDKClient()),
    getFdmV3MixerApiService(),
    new GraphQlUtilsService(),
    getTransformationsApiService()
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
