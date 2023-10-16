import { GraphQlSchemaValidator } from '@platypus/platypus-common-utils';
import {
  DataModelVersionHandler,
  FdmClient,
  FdmMixerApiService,
  TransformationApiService,
  InstancesApiService,
} from '@platypus/platypus-core';

import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const getFdmV3MixerApiService = () => {
  const client = getCogniteSDKClient();
  return new FdmMixerApiService(client);
};

export const getTransformationsApiService = () => {
  const client = getCogniteSDKClient();
  return new TransformationApiService(client);
};

export const getFlexibleDataModelingClient = () => {
  return new FdmClient(
    getFdmV3MixerApiService(),
    getTransformationsApiService(),
    new InstancesApiService(getCogniteSDKClient()),
    new GraphQlSchemaValidator()
  );
};

export const getDataModelVersionsHandler = () => {
  return new DataModelVersionHandler(getFlexibleDataModelingClient());
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
