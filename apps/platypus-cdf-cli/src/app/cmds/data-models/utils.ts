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
import { InstancesApiService } from '@platypus-core/domain/data-model/providers/fdm-next/services/data-modeling-api/instances-api.service';

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
    getTransformationsApiService(),
    new InstancesApiService(getCogniteSDKClient())
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

export const autoIncrementVersion = (currentVersion: string) => {
  const indexOfLastDash = currentVersion.lastIndexOf('-');
  const version = Number(currentVersion.substring(indexOfLastDash + 1));
  // if no valid number, use `currentVersion-1`
  if (Number.isNaN(version)) {
    return `${currentVersion}-1`;
  } else {
    // if valid number
    if (indexOfLastDash === -1) {
      // if there was no dash, then use `{number+1}`
      return `${version + 1}`;
    } else {
      // if there was a dash, then use `versionName-{number+1}`
      return `${currentVersion.substring(0, indexOfLastDash)}-${version + 1}`;
    }
  }
};
